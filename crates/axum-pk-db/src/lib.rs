//! # axum-pk-db — Database plugin for AXUMkit
//!
//! Provides database connectivity, connection pooling, migrations, and a generic
//! repository abstraction. Supports PostgreSQL and SQLite via SQLx.
//!
//! ## Features
//!
//! - `sqlx` (default): Enables SQLx-based backends (Postgres, SQLite)
//! - `deadpool`: Enables deadpool connection manager
//!
//! ## Quick start
//!
//! ```rust,no_run
//! use axum_pk_db::{DbConfig, DbPlugin};
//!
//! let config = DbConfig::new("postgres://user:pass@localhost/mydb")
//!     .pool_size(16)
//!     .auto_migrate(true);
//!
//! let plugin = DbPlugin::new(config);
//! ```

use async_trait::async_trait;
use axum_pk_core::error::{AppError, AppResult};
use axum_pk_core::plugin::{Plugin, PluginContext, PluginOutput};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt;
use std::time::Duration;
use uuid::Uuid;

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

/// Database-specific error type.
#[derive(Debug, thiserror::Error)]
pub enum DbError {
    /// Failed to establish a connection to the database.
    #[error("Connection error: {0}")]
    Connection(String),

    /// A query or execution error.
    #[error("Query error: {0}")]
    Query(String),

    /// A migration error.
    #[error("Migration error: {0}")]
    Migration(String),

    /// A requested resource was not found.
    #[error("{resource} not found: {id}")]
    NotFound { resource: String, id: String },

    /// A unique-constraint / conflict error.
    #[error("Conflict on field '{field}'")]
    Conflict { field: String },

    /// Pool-related error.
    #[error("Pool error: {0}")]
    Pool(String),
}

impl DbError {
    /// Convert into an [`AppError::Database`].
    pub fn into_app_error(self) -> AppError {
        AppError::Database {
            message: self.to_string(),
        }
    }

    /// Create a not-found error.
    pub fn not_found(resource: impl Into<String>, id: impl Into<String>) -> Self {
        Self::NotFound {
            resource: resource.into(),
            id: id.into(),
        }
    }

    /// Create a conflict error.
    pub fn conflict(field: impl Into<String>) -> Self {
        Self::Conflict { field: field.into() }
    }
}

// ---------------------------------------------------------------------------
// Backend
// ---------------------------------------------------------------------------

/// Supported database backends.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DbBackend {
    Postgres,
    MySql,
    Sqlite,
}

impl DbBackend {
    /// Return the backend name as a static string.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Postgres => "postgres",
            Self::MySql => "mysql",
            Self::Sqlite => "sqlite",
        }
    }
}

impl fmt::Display for DbBackend {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

impl TryFrom<&str> for DbBackend {
    type Error = DbError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value.to_lowercase().as_str() {
            "postgres" | "postgresql" => Ok(Self::Postgres),
            "mysql" => Ok(Self::MySql),
            "sqlite" => Ok(Self::Sqlite),
            other => Err(DbError::Connection(format!(
                "Unsupported database backend: {other}"
            ))),
        }
    }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/// Database configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DbConfig {
    /// The database backend to use.
    pub backend: DbBackend,
    /// Full connection string (e.g. `postgres://user:pass@host/db`).
    pub connection_string: String,
    /// Maximum number of connections in the pool.
    #[serde(default = "default_pool_size")]
    pub pool_size: u32,
    /// Minimum number of idle connections to maintain.
    #[serde(default = "default_min_connections")]
    pub min_connections: u32,
    /// Timeout for acquiring a connection from the pool.
    #[serde(default = "default_connect_timeout")]
    pub connect_timeout: Duration,
    /// Whether to run migrations automatically on startup.
    #[serde(default)]
    pub auto_migrate: bool,
}

fn default_pool_size() -> u32 {
    16
}
fn default_min_connections() -> u32 {
    2
}
fn default_connect_timeout() -> Duration {
    Duration::from_secs(10)
}

impl DbConfig {
    /// Create a new configuration from a connection URL.
    ///
    /// The backend is inferred from the URL scheme:
    /// - `postgres://` / `postgresql://` => [`DbBackend::Postgres`]
    /// - `mysql://` => [`DbBackend::MySql`]
    /// - `sqlite://` or any string ending with `.db` / `.sqlite` => [`DbBackend::Sqlite`]
    pub fn new(url: &str) -> Self {
        let backend = if url.starts_with("postgres://") || url.starts_with("postgresql://") {
            DbBackend::Postgres
        } else if url.starts_with("mysql://") {
            DbBackend::MySql
        } else {
            DbBackend::Sqlite
        };

        Self {
            backend,
            connection_string: url.to_string(),
            pool_size: default_pool_size(),
            min_connections: default_min_connections(),
            connect_timeout: default_connect_timeout(),
            auto_migrate: false,
        }
    }

    /// Set the maximum pool size.
    pub fn pool_size(mut self, size: u32) -> Self {
        self.pool_size = size;
        self
    }

    /// Set the minimum number of idle connections.
    pub fn min_connections(mut self, min: u32) -> Self {
        self.min_connections = min;
        self
    }

    /// Set the connection timeout.
    pub fn connect_timeout(mut self, timeout: Duration) -> Self {
        self.connect_timeout = timeout;
        self
    }

    /// Enable or disable automatic migrations on startup.
    pub fn auto_migrate(mut self, enabled: bool) -> Self {
        self.auto_migrate = enabled;
        self
    }
}

impl Default for DbConfig {
    fn default() -> Self {
        Self {
            backend: DbBackend::Sqlite,
            connection_string: "sqlite::memory:".to_string(),
            pool_size: default_pool_size(),
            min_connections: default_min_connections(),
            connect_timeout: default_connect_timeout(),
            auto_migrate: false,
        }
    }
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

/// Database health snapshot.
#[derive(Debug, Clone, Serialize)]
pub struct DbHealth {
    /// Whether the database is reachable.
    pub connected: bool,
    /// Round-trip latency in milliseconds.
    pub latency_ms: u64,
    /// Configured maximum pool size.
    pub pool_size: u32,
    /// Currently active (checked-out) connections.
    pub active_connections: u32,
}

// ---------------------------------------------------------------------------
// Pool
// ---------------------------------------------------------------------------

/// A database connection pool, wrapping the underlying SQLx pool.
#[derive(Debug, Clone)]
pub enum DbPool {
    #[cfg(feature = "sqlx")]
    Pg(sqlx::PgPool),
    #[cfg(feature = "sqlx")]
    Sqlite(sqlx::SqlitePool),
}

impl DbPool {
    /// Returns the backend this pool is connected to.
    pub fn backend(&self) -> DbBackend {
        match self {
            #[cfg(feature = "sqlx")]
            Self::Pg(_) => DbBackend::Postgres,
            #[cfg(feature = "sqlx")]
            Self::Sqlite(_) => DbBackend::Sqlite,
        }
    }

    /// Close the pool, releasing all connections.
    pub async fn close(&self) {
        match self {
            #[cfg(feature = "sqlx")]
            Self::Pg(pool) => pool.close().await,
            #[cfg(feature = "sqlx")]
            Self::Sqlite(pool) => pool.close().await,
        }
    }

    /// Returns true if the pool has been closed.
    pub fn is_closed(&self) -> bool {
        match self {
            #[cfg(feature = "sqlx")]
            Self::Pg(pool) => pool.is_closed(),
            #[cfg(feature = "sqlx")]
            Self::Sqlite(pool) => pool.is_closed(),
        }
    }
}

// ---------------------------------------------------------------------------
// DatabaseBackend trait
// ---------------------------------------------------------------------------

/// Trait for database backend implementations.
#[async_trait]
pub trait DatabaseBackend: Send + Sync + 'static {
    /// Establish a connection and return a pool.
    async fn connect(&self) -> Result<DbPool, DbError>;

    /// Run pending migrations.
    async fn migrate(&self) -> Result<(), DbError>;

    /// Perform a health check.
    async fn health_check(&self) -> Result<DbHealth, DbError>;
}

// ---------------------------------------------------------------------------
// SQLx backend (feature-gated)
// ---------------------------------------------------------------------------

#[cfg(feature = "sqlx")]
pub mod sqlx_backend {
    use super::*;
    /// SQLx-based database backend.
    pub struct SqlxBackend {
        config: DbConfig,
    }

    impl SqlxBackend {
        /// Create a new SQLx backend from a [`DbConfig`].
        pub fn new(config: DbConfig) -> Self {
            Self { config }
        }
    }

    #[async_trait]
    impl DatabaseBackend for SqlxBackend {
        async fn connect(&self) -> Result<DbPool, DbError> {
            match self.config.backend {
                DbBackend::Postgres => {
                    let pool = sqlx::postgres::PgPoolOptions::new()
                        .max_connections(self.config.pool_size)
                        .min_connections(self.config.min_connections)
                        .acquire_timeout(self.config.connect_timeout)
                        .connect(&self.config.connection_string)
                        .await
                        .map_err(|e| DbError::Connection(e.to_string()))?;
                    Ok(DbPool::Pg(pool))
                }
                DbBackend::Sqlite => {
                    let pool = sqlx::sqlite::SqlitePoolOptions::new()
                        .max_connections(self.config.pool_size)
                        .min_connections(self.config.min_connections)
                        .acquire_timeout(self.config.connect_timeout)
                        .connect(&self.config.connection_string)
                        .await
                        .map_err(|e| DbError::Connection(e.to_string()))?;
                    Ok(DbPool::Sqlite(pool))
                }
                DbBackend::MySql => Err(DbError::Connection(
                    "MySQL support is planned but not yet implemented".to_string(),
                )),
            }
        }

        async fn migrate(&self) -> Result<(), DbError> {
            let pool = self.connect().await?;
            match &pool {
                DbPool::Pg(p) => {
                    let migrator = sqlx::migrate::Migrator::new(std::path::Path::new("./migrations"))
                        .await
                        .map_err(|e| DbError::Migration(e.to_string()))?;
                    migrator.run(p).await.map_err(|e| DbError::Migration(e.to_string()))?;
                }
                DbPool::Sqlite(p) => {
                    let migrator = sqlx::migrate::Migrator::new(std::path::Path::new("./migrations"))
                        .await
                        .map_err(|e| DbError::Migration(e.to_string()))?;
                    migrator.run(p).await.map_err(|e| DbError::Migration(e.to_string()))?;
                }
            }
            Ok(())
        }

        async fn health_check(&self) -> Result<DbHealth, DbError> {
            let pool = self.connect().await?;
            let start = std::time::Instant::now();

            let connected = match &pool {
                DbPool::Pg(p) => {
                    sqlx::query("SELECT 1")
                        .execute(p)
                        .await
                        .map(|_| true)
                        .unwrap_or(false)
                }
                DbPool::Sqlite(p) => {
                    sqlx::query("SELECT 1")
                        .execute(p)
                        .await
                        .map(|_| true)
                        .unwrap_or(false)
                }
            };

            let latency_ms = start.elapsed().as_millis() as u64;

            Ok(DbHealth {
                connected,
                latency_ms,
                pool_size: self.config.pool_size,
                active_connections: 0,
            })
        }
    }
}

// ---------------------------------------------------------------------------
// Repository trait
// ---------------------------------------------------------------------------

/// Generic CRUD repository trait.
///
/// `T` is the entity type, `ID` is its identifier type.
#[async_trait]
pub trait Repository<T, ID = Uuid>: Send + Sync + 'static
where
    T: Send + Sync,
    ID: Send + Sync,
{
    /// Find a single entity by its ID.
    async fn find_by_id(&self, id: ID) -> Result<Option<T>, DbError>;

    /// Find all entities, optionally paginated.
    async fn find_all(&self, limit: Option<u32>, offset: Option<u32>) -> Result<Vec<T>, DbError>;

    /// Find a single entity matching a filter.
    async fn find_one(&self, filter: HashMap<String, String>) -> Result<Option<T>, DbError>;

    /// Count all entities.
    async fn count(&self) -> Result<u64, DbError>;

    /// Check whether an entity with the given ID exists.
    async fn exists(&self, id: ID) -> Result<bool, DbError>;

    /// Insert a new entity.
    async fn create(&self, entity: &T) -> Result<T, DbError>;

    /// Insert multiple entities in a batch.
    async fn create_many(&self, entities: &[T]) -> Result<Vec<T>, DbError>;

    /// Update an existing entity.
    async fn update(&self, id: ID, entity: &T) -> Result<T, DbError>;

    /// Delete an entity by ID.
    async fn delete(&self, id: ID) -> Result<bool, DbError>;

    /// Delete multiple entities by ID.
    async fn delete_many(&self, ids: &[ID]) -> Result<u64, DbError>;
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

/// A database migration.
#[async_trait]
pub trait Migration: Send + Sync + 'static {
    /// Monotonically increasing version identifier (e.g. `"20240101000001"`).
    fn version(&self) -> &str;

    /// Human-readable migration name.
    fn name(&self) -> &str;

    /// Apply the migration.
    async fn up(&self) -> Result<(), DbError>;

    /// Roll back the migration.
    async fn down(&self) -> Result<(), DbError>;
}

/// Status of a single migration.
#[derive(Debug, Clone, Serialize)]
pub struct MigrationStatus {
    /// Migration version.
    pub version: String,
    /// Migration name.
    pub name: String,
    /// When the migration was applied, if at all.
    pub applied_at: Option<DateTime<Utc>>,
}

/// Report produced after running migrations.
#[derive(Debug, Clone, Serialize)]
pub struct MigrationReport {
    /// Number of migrations that were applied.
    pub applied: usize,
}

impl MigrationReport {
    /// Create a new report.
    pub fn new(applied: usize) -> Self {
        Self { applied }
    }
}

/// Runs and tracks migrations.
pub struct MigrationRunner {
    #[allow(dead_code)]
    pool: DbPool,
    migrations: Vec<Box<dyn Migration>>,
}

impl MigrationRunner {
    /// Create a new migration runner.
    pub fn new(pool: DbPool) -> Self {
        Self {
            pool,
            migrations: Vec::new(),
        }
    }

    /// Add a migration to the runner.
    pub fn add_migration<M: Migration>(&mut self, migration: M) {
        self.migrations.push(Box::new(migration));
    }

    /// Run all pending migrations.
    pub async fn run(&self) -> Result<MigrationReport, DbError> {
        let mut applied = 0;
        for migration in &self.migrations {
            tracing::info!(
                "Applying migration {} — {}",
                migration.version(),
                migration.name()
            );
            migration.up().await?;
            applied += 1;
        }
        Ok(MigrationReport::new(applied))
    }

    /// Roll back the last `steps` migrations.
    pub async fn rollback(&self, steps: u32) -> Result<MigrationReport, DbError> {
        let steps = steps as usize;
        let start = self.migrations.len().saturating_sub(steps);
        let to_rollback = &self.migrations[start..];

        let mut rolled_back = 0;
        for migration in to_rollback.iter().rev() {
            tracing::info!(
                "Rolling back migration {} — {}",
                migration.version(),
                migration.name()
            );
            migration.down().await?;
            rolled_back += 1;
        }
        Ok(MigrationReport::new(rolled_back))
    }

    /// Return the status of every known migration.
    pub async fn status(&self) -> Vec<MigrationStatus> {
        self.migrations
            .iter()
            .map(|m| MigrationStatus {
                version: m.version().to_string(),
                name: m.name().to_string(),
                applied_at: None,
            })
            .collect()
    }
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

/// The database plugin. Wraps a [`DbConfig`] and implements [`Plugin`].
pub struct DbPlugin {
    config: DbConfig,
}

impl DbPlugin {
    /// Create a new database plugin from a [`DbConfig`].
    pub fn new(config: DbConfig) -> Self {
        Self { config }
    }

    /// Access the configuration.
    pub fn config(&self) -> &DbConfig {
        &self.config
    }
}

#[async_trait]
impl Plugin for DbPlugin {
    fn name(&self) -> &'static str {
        "axum-pk-db"
    }

    fn version(&self) -> &'static str {
        env!("CARGO_PKG_VERSION")
    }

    async fn initialize(&self, _ctx: &PluginContext) -> AppResult<PluginOutput> {
        tracing::info!(
            "Initializing database plugin (backend: {})",
            self.config.backend
        );

        #[cfg(feature = "sqlx")]
        {
            let backend = sqlx_backend::SqlxBackend::new(self.config.clone());
            let _pool = backend.connect().await.map_err(|e| {
                AppError::Database {
                    message: format!("Failed to connect to database: {e}"),
                }
            })?;

            if self.config.auto_migrate {
                tracing::info!("Auto-migrate enabled, running migrations");
                backend.migrate().await.map_err(|e| {
                    AppError::Database {
                        message: format!("Migration failed: {e}"),
                    }
                })?;
            }

            let health = backend.health_check().await.map_err(|e| {
                AppError::Database {
                    message: format!("Health check failed: {e}"),
                }
            })?;

            tracing::info!(
                "Database connected (latency: {}ms, pool_size: {})",
                health.latency_ms,
                health.pool_size
            );

            Ok(PluginOutput::empty("axum-pk-db"))
        }

        #[cfg(not(feature = "sqlx"))]
        {
            Err(AppError::Config(
                "axum-pk-db requires the 'sqlx' feature to be enabled".to_string(),
            ))
        }
    }

    async fn shutdown(&self) -> AppResult<()> {
        tracing::info!("Shutting down database plugin");
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // -- DbConfig builder ---------------------------------------------------

    #[test]
    fn test_db_config_new_postgres() {
        let config = DbConfig::new("postgres://user:pass@localhost/mydb");
        assert_eq!(config.backend, DbBackend::Postgres);
        assert_eq!(config.connection_string, "postgres://user:pass@localhost/mydb");
    }

    #[test]
    fn test_db_config_new_sqlite() {
        let config = DbConfig::new("sqlite://test.db");
        assert_eq!(config.backend, DbBackend::Sqlite);
    }

    #[test]
    fn test_db_config_builder() {
        let config = DbConfig::new("postgres://localhost/db")
            .pool_size(32)
            .min_connections(5)
            .connect_timeout(Duration::from_secs(30))
            .auto_migrate(true);

        assert_eq!(config.pool_size, 32);
        assert!(config.min_connections == 5);
        assert_eq!(config.connect_timeout, Duration::from_secs(30));
        assert!(config.auto_migrate);
    }

    #[test]
    fn test_db_config_defaults() {
        let config = DbConfig::default();
        assert_eq!(config.backend, DbBackend::Sqlite);
        assert_eq!(config.pool_size, 16);
        assert_eq!(config.min_connections, 2);
        assert_eq!(config.connect_timeout, Duration::from_secs(10));
        assert!(!config.auto_migrate);
    }

    // -- DbError display ---------------------------------------------------

    #[test]
    fn test_db_error_display() {
        let err = DbError::Connection("timeout".to_string());
        assert_eq!(err.to_string(), "Connection error: timeout");

        let err = DbError::Query("syntax error".to_string());
        assert_eq!(err.to_string(), "Query error: syntax error");

        let err = DbError::Migration("bad version".to_string());
        assert_eq!(err.to_string(), "Migration error: bad version");

        let err = DbError::NotFound {
            resource: "User".to_string(),
            id: "42".to_string(),
        };
        assert_eq!(err.to_string(), "User not found: 42");

        let err = DbError::Conflict {
            field: "email".to_string(),
        };
        assert_eq!(err.to_string(), "Conflict on field 'email'");

        let err = DbError::Pool("exhausted".to_string());
        assert_eq!(err.to_string(), "Pool error: exhausted");
    }

    #[test]
    fn test_db_error_not_found_helper() {
        let err = DbError::not_found("Post", "abc-123");
        match err {
            DbError::NotFound { resource, id } => {
                assert_eq!(resource, "Post");
                assert_eq!(id, "abc-123");
            }
            _ => panic!("Expected NotFound variant"),
        }
    }

    #[test]
    fn test_db_error_conflict_helper() {
        let err = DbError::conflict("username");
        match err {
            DbError::Conflict { field } => assert_eq!(field, "username"),
            _ => panic!("Expected Conflict variant"),
        }
    }

    #[test]
    fn test_db_error_into_app_error() {
        let db_err = DbError::Connection("refused".to_string());
        let app_err = db_err.into_app_error();
        match app_err {
            AppError::Database { message } => {
                assert!(message.contains("refused"), "message was: {message}");
            }
            _ => panic!("Expected AppError::Database"),
        }
    }

    // -- DbBackend as_str --------------------------------------------------

    #[test]
    fn test_db_backend_as_str() {
        assert_eq!(DbBackend::Postgres.as_str(), "postgres");
        assert_eq!(DbBackend::MySql.as_str(), "mysql");
        assert_eq!(DbBackend::Sqlite.as_str(), "sqlite");
    }

    #[test]
    fn test_db_backend_display() {
        let s = format!("{}", DbBackend::Postgres);
        assert_eq!(s, "postgres");
    }

    #[test]
    fn test_db_backend_try_from() {
        assert_eq!(DbBackend::try_from("postgres").unwrap(), DbBackend::Postgres);
        assert_eq!(DbBackend::try_from("postgresql").unwrap(), DbBackend::Postgres);
        assert_eq!(DbBackend::try_from("mysql").unwrap(), DbBackend::MySql);
        assert_eq!(DbBackend::try_from("sqlite").unwrap(), DbBackend::Sqlite);
        assert!(DbBackend::try_from("oracle").is_err());
    }

    // -- MigrationReport ---------------------------------------------------

    #[test]
    fn test_migration_report() {
        let report = MigrationReport::new(5);
        assert_eq!(report.applied, 5);

        let report = MigrationReport::new(0);
        assert_eq!(report.applied, 0);
    }

    // -- MigrationStatus ---------------------------------------------------

    #[test]
    fn test_migration_status() {
        let status = MigrationStatus {
            version: "20240101000001".to_string(),
            name: "create_users_table".to_string(),
            applied_at: None,
        };
        assert_eq!(status.version, "20240101000001");
        assert_eq!(status.name, "create_users_table");
        assert!(status.applied_at.is_none());
    }

    // -- DbHealth ----------------------------------------------------------

    #[test]
    fn test_db_health() {
        let health = DbHealth {
            connected: true,
            latency_ms: 42,
            pool_size: 16,
            active_connections: 3,
        };
        assert!(health.connected);
        assert_eq!(health.latency_ms, 42);
        assert_eq!(health.pool_size, 16);
        assert_eq!(health.active_connections, 3);
    }

    // -- DbPlugin ----------------------------------------------------------

    #[test]
    fn test_db_plugin_name() {
        let plugin = DbPlugin::new(DbConfig::default());
        assert_eq!(plugin.name(), "axum-pk-db");
    }

    #[test]
    fn test_db_plugin_config() {
        let config = DbConfig::new("postgres://localhost/db").pool_size(64);
        let plugin = DbPlugin::new(config);
        assert_eq!(plugin.config().pool_size, 64);
        assert_eq!(plugin.config().backend, DbBackend::Postgres);
    }

    // -- MigrationRunner (without running real migrations) -----------------

    #[tokio::test]
    async fn test_migration_runner_status_empty() {
        // We need a pool to create a runner; use a SQLite in-memory pool.
        // This test only works with the sqlx feature.
        #[cfg(feature = "sqlx")]
        {
            let pool = DbPool::Sqlite(
                sqlx::sqlite::SqlitePoolOptions::new()
                    .connect("sqlite::memory:")
                    .await
                    .unwrap(),
            );
            let runner = MigrationRunner::new(pool);
            let statuses = runner.status().await;
            assert!(statuses.is_empty());
        }
    }
}
