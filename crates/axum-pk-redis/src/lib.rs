//! axum-pk-redis — Redis integration plugin for AXUMkit.
//!
//! Provides caching, rate limiting, and key-value storage via Redis.

use async_trait::async_trait;
use axum::http::{HeaderValue, StatusCode};
use axum::response::{IntoResponse, Response};
use axum_pk_core::error::{AppError, AppResult};
use axum_pk_core::{Plugin, PluginContext, PluginOutput};
use chrono::Utc;
use deadpool_redis::{Config as DeadpoolConfig, Pool, Runtime};
use redis::AsyncCommands;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::sync::Arc;
use std::time::Duration;
use tracing::{debug, error, info, warn};

// ─────────────────────────────────────────────────────────────────────────────
// Error Type
// ─────────────────────────────────────────────────────────────────────────────

/// Errors from the Redis plugin.
#[derive(thiserror::Error, Debug)]
pub enum RedisError {
    #[error("Redis connection error: {0}")]
    Connection(String),
    #[error("Redis command error: {0}")]
    Command(String),
    #[error("Redis serialization error: {0}")]
    Serialization(String),
    #[error("Redis pool error: {0}")]
    Pool(String),
    #[error("Redis key not found: {0}")]
    KeyNotFound(String),
    #[error("Rate limited. Retry after {retry_after} seconds")]
    RateLimited { retry_after: u64 },
}

impl IntoResponse for RedisError {
    fn into_response(self) -> Response {
        match self {
            RedisError::Connection(_) | RedisError::Pool(_) => (
                StatusCode::SERVICE_UNAVAILABLE,
                "Service temporarily unavailable",
            )
                .into_response(),
            RedisError::RateLimited { retry_after } => {
                let hv = HeaderValue::from_str(&retry_after.to_string())
                    .unwrap_or_else(|_| HeaderValue::from_static("60"));
                (
                    StatusCode::TOO_MANY_REQUESTS,
                    [(axum::http::header::RETRY_AFTER, hv)],
                    format!("Rate limited. Retry after {retry_after} seconds"),
                )
                    .into_response()
            }
            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error",
            )
                .into_response(),
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

/// Redis connection configuration.
#[derive(Clone, Debug)]
pub struct RedisConfig {
    pub url: String,
    pub pool_size: u32,
    pub key_prefix: String,
    pub default_ttl: Duration,
    pub command_timeout: Duration,
}

impl RedisConfig {
    pub fn new(url: &str) -> Self {
        Self {
            url: url.to_string(),
            pool_size: 10,
            key_prefix: String::new(),
            default_ttl: Duration::from_secs(300),
            command_timeout: Duration::from_secs(5),
        }
    }

    pub fn with_pool_size(mut self, size: u32) -> Self {
        self.pool_size = size;
        self
    }
    pub fn with_key_prefix(mut self, prefix: &str) -> Self {
        self.key_prefix = prefix.to_string();
        self
    }
    pub fn with_default_ttl(mut self, ttl: Duration) -> Self {
        self.default_ttl = ttl;
        self
    }
    pub fn with_command_timeout(mut self, timeout: Duration) -> Self {
        self.command_timeout = timeout;
        self
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache Service
// ─────────────────────────────────────────────────────────────────────────────

/// Typed cache layer over Redis. Values are JSON-serialized.
#[derive(Clone)]
pub struct CacheService {
    pool: Pool,
    config: RedisConfig,
}

impl CacheService {
    pub fn new(pool: Pool, config: RedisConfig) -> Self {
        Self { pool, config }
    }

    fn full_key(&self, key: &str) -> String {
        if self.config.key_prefix.is_empty() {
            key.to_string()
        } else {
            format!("{}{}", self.config.key_prefix, key)
        }
    }

    /// Fetch and JSON-deserialize a value.
    pub async fn get<T: DeserializeOwned>(&self, key: &str) -> Result<Option<T>, RedisError> {
        let full = self.full_key(key);
        let mut conn = self.pool.get().await.map_err(|e| {
            error!(error = %e, "failed to get Redis connection");
            RedisError::Pool(e.to_string())
        })?;
        let raw: Option<String> = conn.get(&full).await.map_err(|e| {
            error!(error = %e, key = %full, "GET failed");
            RedisError::Command(e.to_string())
        })?;
        match raw {
            Some(s) => {
                let val = serde_json::from_str::<T>(&s).map_err(|e| {
                    error!(error = %e, key = %full, "deserialize failed");
                    RedisError::Serialization(e.to_string())
                })?;
                debug!(key = %full, "cache hit");
                Ok(Some(val))
            }
            None => {
                debug!(key = %full, "cache miss");
                Ok(None)
            }
        }
    }

    /// Store a JSON-serialized value with optional TTL.
    pub async fn set<T: Serialize>(
        &self,
        key: &str,
        value: &T,
        ttl: Option<Duration>,
    ) -> Result<(), RedisError> {
        let full = self.full_key(key);
        let json = serde_json::to_string(value).map_err(|e| {
            error!(error = %e, "serialize failed");
            RedisError::Serialization(e.to_string())
        })?;
        let ttl_secs = ttl.unwrap_or(self.config.default_ttl).as_secs();
        let mut conn = self.pool.get().await.map_err(|e| {
            error!(error = %e, "pool get failed");
            RedisError::Pool(e.to_string())
        })?;
        let _: () = conn.set_ex(&full, json, ttl_secs).await.map_err(|e| {
            error!(error = %e, key = %full, "SETEX failed");
            RedisError::Command(e.to_string())
        })?;
        debug!(key = %full, ttl = ttl_secs, "cache set");
        Ok(())
    }

    /// Delete a key. Returns true if it existed.
    pub async fn delete(&self, key: &str) -> Result<bool, RedisError> {
        let full = self.full_key(key);
        let mut conn = self.pool.get().await.map_err(|e| RedisError::Pool(e.to_string()))?;
        let count: i64 = conn.del(&full).await.map_err(|e| RedisError::Command(e.to_string()))?;
        Ok(count > 0)
    }

    /// Check if a key exists.
    pub async fn exists(&self, key: &str) -> Result<bool, RedisError> {
        let full = self.full_key(key);
        let mut conn = self.pool.get().await.map_err(|e| RedisError::Pool(e.to_string()))?;
        conn.exists(&full).await.map_err(|e| RedisError::Command(e.to_string()))
    }

    /// Increment a key's value.
    pub async fn increment(&self, key: &str, amount: i64) -> Result<i64, RedisError> {
        let full = self.full_key(key);
        let mut conn = self.pool.get().await.map_err(|e| RedisError::Pool(e.to_string()))?;
        conn.incr(&full, amount).await.map_err(|e| RedisError::Command(e.to_string()))
    }

    /// Get-or-set: return cached value or compute, cache, and return.
    pub async fn get_or_set<T, F>(
        &self,
        key: &str,
        f: F,
        ttl: Option<Duration>,
    ) -> Result<T, RedisError>
    where
        T: Serialize + DeserializeOwned,
        F: FnOnce() -> Result<T, RedisError>,
    {
        if let Some(val) = self.get::<T>(key).await? {
            return Ok(val);
        }
        let val = f()?;
        self.set(key, &val, ttl).await?;
        Ok(val)
    }

    pub fn pool(&self) -> &Pool {
        &self.pool
    }
    pub fn config(&self) -> &RedisConfig {
        &self.config
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────────────────────────────────────

/// Rate limiter configuration.
#[derive(Clone, Debug)]
pub struct RateLimitConfig {
    pub requests: u32,
    pub window: Duration,
    pub key_prefix: String,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            requests: 100,
            window: Duration::from_secs(60),
            key_prefix: "rl:".to_string(),
        }
    }
}

impl RateLimitConfig {
    pub fn new() -> Self {
        Self::default()
    }
    pub fn with_requests(mut self, n: u32) -> Self {
        self.requests = n;
        self
    }
    pub fn with_window(mut self, w: Duration) -> Self {
        self.window = w;
        self
    }
    pub fn with_key_prefix(mut self, p: &str) -> Self {
        self.key_prefix = p.to_string();
        self
    }
}

/// Result of a rate-limit check.
#[derive(Clone, Debug)]
pub struct RateLimitStatus {
    pub allowed: bool,
    pub remaining: u32,
    pub reset_at: u64,
    pub retry_after: Option<u64>,
}

/// Sliding-window rate limiter backed by Redis INCR + EXPIRE.
pub struct RateLimiter {
    cache: CacheService,
    config: RateLimitConfig,
}

impl RateLimiter {
    pub fn new(cache: CacheService, config: RateLimitConfig) -> Self {
        Self { cache, config }
    }

    fn build_key(&self, key: &str) -> String {
        format!("{}{}", self.config.key_prefix, key)
    }

    /// Check whether a request is allowed under the rate limit.
    pub async fn check(&self, key: &str) -> Result<RateLimitStatus, RedisError> {
        let full = self.build_key(key);
        let pool = self.cache.pool();
        let mut conn = pool.get().await.map_err(|e| RedisError::Pool(e.to_string()))?;

        // Atomic INCR
        let count: i64 = conn.incr(&full, 1i64).await.map_err(|e| {
            error!(error = %e, key = %full, "INCR failed");
            RedisError::Command(e.to_string())
        })?;

        // Set TTL on first request in a new window
        if count == 1 {
            let secs = self.config.window.as_secs();
            let _: () = conn.expire(&full,secs as i64).await.map_err(|e| {
                error!(error = %e, key = %full, "EXPIRE failed");
                RedisError::Command(e.to_string())
            })?;
        }

        let max = self.config.requests as i64;
        let now = Utc::now().timestamp() as u64;
        let reset_at = now + self.config.window.as_secs();

        if count <= max {
            Ok(RateLimitStatus {
                allowed: true,
                remaining: (max - count) as u32,
                reset_at,
                retry_after: None,
            })
        } else {
            warn!(key = %full, count, limit = max, "rate limit exceeded");
            Ok(RateLimitStatus {
                allowed: false,
                remaining: 0,
                reset_at,
                retry_after: Some(self.config.window.as_secs()),
            })
        }
    }

    pub fn config(&self) -> &RateLimitConfig {
        &self.config
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Plugin
// ─────────────────────────────────────────────────────────────────────────────

/// Shared state exported by the Redis plugin.
pub struct RedisState {
    pub cache: CacheService,
    pub limiter: RateLimiter,
}

/// The Redis AXUMkit plugin.
pub struct RedisPlugin {
    config: RedisConfig,
    rate_limit_config: RateLimitConfig,
}

impl RedisPlugin {
    pub fn new(config: RedisConfig) -> Self {
        Self {
            config,
            rate_limit_config: RateLimitConfig::default(),
        }
    }
    pub fn with_rate_limit_config(mut self, cfg: RateLimitConfig) -> Self {
        self.rate_limit_config = cfg;
        self
    }
    pub fn redis_config(&self) -> &RedisConfig {
        &self.config
    }
}

#[async_trait]
impl Plugin for RedisPlugin {
    fn name(&self) -> &'static str {
        "axum-pk-redis"
    }
    fn version(&self) -> &'static str {
        env!("CARGO_PKG_VERSION")
    }
    fn dependencies(&self) -> Vec<&'static str> {
        vec!["axum-pk-core"]
    }

    async fn initialize(&self, _ctx: &PluginContext) -> AppResult<PluginOutput> {
        info!(url = %self.config.url, pool_size = self.config.pool_size, "initializing Redis plugin");

        let mut dp_cfg = DeadpoolConfig::from_url(&self.config.url);
        dp_cfg.pool = Some(deadpool_redis::PoolConfig::new(self.config.pool_size as usize));

        let pool = dp_cfg.create_pool(Some(Runtime::Tokio1)).map_err(|e| {
            error!(error = %e, "failed to create Redis pool");
            AppError::Unavailable(e.to_string())
        })?;

        // Verify connectivity
        {
            let mut conn = pool.get().await.map_err(|e| {
                error!(error = %e, "connectivity check failed");
                AppError::Unavailable(e.to_string())
            })?;
            let pong: String = redis::cmd("PING")
                .query_async(&mut conn)
                .await
                .map_err(|e| AppError::Unavailable(e.to_string()))?;
            if pong != "PONG" {
                return Err(AppError::Unavailable(format!("unexpected PING: {pong}")));
            }
        }

        info!("Redis connection verified");
        let cache = CacheService::new(pool, self.config.clone());
        let limiter = RateLimiter::new(cache.clone(), self.rate_limit_config.clone());
        let state = Arc::new(RedisState { cache, limiter });
        Ok(PluginOutput::empty(self.name()).with_state(state))
    }

    async fn shutdown(&self) -> AppResult<()> {
        info!("Redis plugin shutdown");
        Ok(())
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    // Config defaults
    #[test]
    fn redis_config_defaults() {
        let c = RedisConfig::new("redis://localhost:6379");
        assert_eq!(c.url, "redis://localhost:6379");
        assert_eq!(c.pool_size, 10);
        assert_eq!(c.key_prefix, "");
        assert_eq!(c.default_ttl, Duration::from_secs(300));
        assert_eq!(c.command_timeout, Duration::from_secs(5));
    }

    #[test]
    fn redis_config_builder_overrides() {
        let c = RedisConfig::new("redis://x:6380")
            .with_pool_size(20)
            .with_key_prefix("app:")
            .with_default_ttl(Duration::from_secs(600));
        assert_eq!(c.pool_size, 20);
        assert_eq!(c.key_prefix, "app:");
        assert_eq!(c.default_ttl, Duration::from_secs(600));
    }

    // Pool-key helpers
    #[test]
    fn full_key_no_prefix() {
        let pool = dummy_pool();
        let cfg = RedisConfig::new("redis://localhost:6379");
        let svc = CacheService::new(pool, cfg);
        assert_eq!(svc.full_key("user:42"), "user:42");
    }

    #[test]
    fn full_key_with_prefix() {
        let pool = dummy_pool();
        let cfg = RedisConfig::new("redis://localhost:6379").with_key_prefix("myapp:");
        let svc = CacheService::new(pool, cfg);
        assert_eq!(svc.full_key("user:42"), "myapp:user:42");
    }

    // Rate-limit status
    #[test]
    fn rate_limit_half_used() {
        let s = RateLimitStatus { allowed: true, remaining: 50, reset_at: 100, retry_after: None };
        assert!(s.allowed);
        assert_eq!(s.remaining, 50);
        assert!(s.retry_after.is_none());
    }

    #[test]
    fn rate_limit_fully_used() {
        let s = RateLimitStatus { allowed: false, remaining: 0, reset_at: 160, retry_after: Some(60) };
        assert!(!s.allowed);
        assert_eq!(s.remaining, 0);
        assert_eq!(s.retry_after, Some(60));
    }

    // RateLimitConfig
    #[test]
    fn rate_limit_config_defaults() {
        let c = RateLimitConfig::new();
        assert_eq!(c.requests, 100);
        assert_eq!(c.window, Duration::from_secs(60));
        assert_eq!(c.key_prefix, "rl:");
    }

    #[test]
    fn rate_limit_config_builder() {
        let c = RateLimitConfig::new().with_requests(50).with_window(Duration::from_secs(30));
        assert_eq!(c.requests, 50);
        assert_eq!(c.window, Duration::from_secs(30));
    }

    // RateLimiter key
    #[test]
    fn rate_limiter_build_key() {
        let pool = dummy_pool();
        let cfg = RedisConfig::new("redis://localhost:6379");
        let cache = CacheService::new(pool, cfg);
        let rl = RateLimiter::new(cache, RateLimitConfig::default());
        assert_eq!(rl.build_key("127.0.0.1"), "rl:127.0.0.1");
    }

    // Error display
    #[test]
    fn redis_error_display() {
        assert_eq!(RedisError::Connection("t".into()).to_string(), "Redis connection error: t");
        assert_eq!(RedisError::Command("c".into()).to_string(), "Redis command error: c");
        assert_eq!(RedisError::Serialization("s".into()).to_string(), "Redis serialization error: s");
        assert_eq!(RedisError::Pool("p".into()).to_string(), "Redis pool error: p");
        assert_eq!(RedisError::KeyNotFound("k".into()).to_string(), "Redis key not found: k");
        assert_eq!(RedisError::RateLimited { retry_after: 30 }.to_string(), "Rate limited. Retry after 30 seconds");
    }

    // Plugin
    #[test]
    fn redis_plugin_name() {
        let p = RedisPlugin::new(RedisConfig::new("redis://localhost:6379"));
        assert_eq!(p.name(), "axum-pk-redis");
    }

    #[test]
    fn redis_plugin_deps() {
        let p = RedisPlugin::new(RedisConfig::new("redis://localhost:6379"));
        assert_eq!(p.dependencies(), vec!["axum-pk-core"]);
    }

    /// Create a dummy pool for unit tests (will fail on actual I/O).
    fn dummy_pool() -> Pool {
        let dp = DeadpoolConfig::from_url("redis://localhost:0");
        dp.create_pool(Some(Runtime::Tokio1)).expect("pool creation ok")
    }
}
