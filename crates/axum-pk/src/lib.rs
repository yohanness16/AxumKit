//! # AXUMkit — Modular, Pluggable Rust Backend Framework
//!
//! The meta-crate that re-exports all AXUMkit plugins and provides the
//! application builder.

pub use axum_pk_core;
#[cfg(feature = "config")]
pub use axum_pk_config as config;
#[cfg(feature = "db")]
pub use axum_pk_db as db;
#[cfg(feature = "auth")]
pub use axum_pk_auth as auth;
#[cfg(feature = "api")]
pub use axum_pk_api as api;
#[cfg(feature = "redis")]
pub use axum_pk_redis as redis;

use async_trait::async_trait;
use axum_pk_core::error::{AppError, AppResult};
use axum_pk_core::plugin::{Plugin, PluginContext, PluginOutput, PluginRegistry};
use std::net::SocketAddr;
use tokio::signal;
use tracing::info;

/// Application builder — the main entry point for AXUMkit applications.
pub struct App {
    registry: PluginRegistry,
    routes: Vec<(&'static str, String)>,
    shutdown_hooks: Vec<Box<dyn Fn() + Send + Sync>>,
}

impl App {
    pub fn new() -> Self {
        Self {
            registry: PluginRegistry::new(),
            routes: Vec::new(),
            shutdown_hooks: Vec::new(),
        }
    }

    pub fn plugin<P: Plugin>(mut self, plugin: P) -> Self {
        self.registry.register(plugin);
        self
    }

    pub fn routes(mut self, routes: Vec<(&'static str, String)>) -> Self {
        self.routes = routes;
        self
    }

    pub fn on_shutdown<F: Fn() + Send + Sync + 'static>(mut self, f: F) -> Self {
        self.shutdown_hooks.push(Box::new(f));
        self
    }

    pub async fn run(self, addr: &str) -> AppResult<()> {
        info!("AXUMkit v{} starting...", env!("CARGO_PKG_VERSION"));
        info!("Registered {} plugins", self.registry.len());

        let ctx = PluginContext::new();
        let outputs = self.registry.initialize_all(&ctx).await?;
        info!("{} plugins initialized", outputs.len());

        for (method, path) in &self.routes {
            info!("  {} {}", method, path);
        }

        let addr: SocketAddr = addr.parse().map_err(|e| {
            AppError::Config(format!("Invalid address '{}': {}", addr, e))
        })?;

        info!("Listening on http://{}", addr);

        let listener = tokio::net::TcpListener::bind(addr).await.map_err(|e| {
            AppError::Unavailable(format!("Failed to bind to {}: {}", addr, e))
        })?;

        axum::serve(listener, axum::Router::new())
            .with_graceful_shutdown(shutdown_signal())
            .await
            .map_err(|e| AppError::Internal {
                source: anyhow::anyhow!("Server error: {}", e),
            })?;

        for hook in &self.shutdown_hooks {
            hook();
        }

        self.registry.shutdown_all().await?;
        info!("AXUMkit shut down cleanly");
        Ok(())
    }
}

impl Default for App {
    fn default() -> Self {
        Self::new()
    }
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install ctrl-c handler");
        info!("Received ctrl-c, shutting down...");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
        info!("Received SIGTERM, shutting down...");
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}

/// Prelude — import everything needed for a typical AXUMkit app.
pub mod prelude {
    pub use crate::App;
    #[cfg(feature = "config")]
    pub use axum_pk_config::ConfigBuilder;
    #[cfg(feature = "db")]
    pub use axum_pk_db::{DbConfig, DbHealth, DbPlugin, DatabaseBackend, Migration, Repository};
    #[cfg(feature = "auth")]
    pub use axum_pk_auth::{
        AuthError, AuthPlugin, AuthUser, Claims, JwtConfig, JwtService, PasswordService,
        Permission, Rbac, Role,
    };
    #[cfg(feature = "api")]
    pub use axum_pk_api::{
        ApiErrorResponse, ApiSuccess, FilterParams, Paginate, Paginated, PaginationMeta,
        PaginationParams, SortOrder, SortParams,
    };
    #[cfg(feature = "redis")]
    pub use axum_pk_redis::{
        CacheService, RateLimitConfig, RateLimitStatus, RateLimiter, RedisConfig, RedisError,
        RedisPlugin,
    };
    pub use axum_pk_core::error::{AppError, AppResult, FieldError};
    pub use axum_pk_core::plugin::{Plugin, PluginContext, PluginOutput};
    pub use axum_pk_core::types::{Entity, Id, SoftDeletable, Timestamps};
}
