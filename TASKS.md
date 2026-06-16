# AXUMkit — Implementation Roadmap

> **Goal:** Build a modular, pluggable Rust backend framework where developers `cargo add` only what they want, define models with derive macros, and ship.

**Timeline:** 3 weeks (June 16 — July 4, 2026)
**Repo:** https://github.com/yohanness16/AxumKit

---

## ✅ Week 1: Core Foundation (June 16 — June 22)

### Phase 0 — Workspace & Core (✅ Complete)
- [x] Initialize git repo with `main` branch
- [x] Create Cargo workspace with all crate stubs
- [x] Implement `axum-pk-core`: Plugin trait, PluginContext, PluginOutput, PluginRegistry
- [x] Implement unified `AppError` type (10 variants, HTTP status mapping)
- [x] Implement core types: `Id`, `Entity`, `Timestamps`, `SoftDeletable`
- [x] Implement `ConfigProvider` trait
- [x] Write 22 unit tests — all passing

### Phase 1 — Database Plugin (✅ Complete)
- [x] `axum-pk-db`: Database plugin with SQLx backend
- [x] `DbError` type (Connection, Query, Migration, NotFound, Conflict, Pool)
- [x] `DbConfig` with builder pattern
- [x] `DatabaseBackend` trait (connect, migrate, health_check)
- [x] `Repository<T>` generic CRUD trait
- [x] `Migration` trait + `MigrationRunner`
- [x] `DbPlugin` implementing `axum_pk_core::Plugin`
- [x] 17 unit tests — all passing

### Phase 2 — Auth Plugin (✅ Complete)
- [x] `axum-pk-auth`: JWT + RBAC + Argon2 password hashing
- [x] `AuthError` type with `IntoResponse`
- [x] `Claims`, `JwtConfig`, `JwtService` (HS256)
- [x] `PasswordService` (Argon2id)
- [x] `Role` / `Permission` enums with hierarchy
- [x] `Rbac` access control (SuperAdmin > Admin > Moderator > User)
- [x] `AuthUser`, `AuthPlugin`
- [x] 13 unit tests — all passing

### Phase 3 — API Plugin (✅ Complete)
- [x] `axum-pk-api`: Pagination, filtering, sorting, OpenAPI types
- [x] `PaginationParams`, `PaginationMeta`, `Paginated<T>`
- [x] `SortOrder`, `SortParams`, `FilterOperator`, `FilterParams`
- [x] `ApiSuccess<T>`, `ApiErrorResponse`
- [x] `Paginate<T>` extension trait for Vec
- [x] `QueryPaginate` Axum extractor
- [x] 20 unit tests — all passing

### Phase 4 — Config + Redis Plugins (✅ Complete)
- [x] `axum-pk-config`: Layered config (env > .env > file > defaults)
- [x] `axum-pk-redis`: Cache, rate limiting, connection pooling
- [x] `CacheService` with JSON serialization
- [x] `RateLimiter` with sliding-window INCR+EXPIRE
- [x] 12 unit tests — all passing

---

## 🔨 Week 2: Meta-Crate, CLI, Dashboard (June 23 — June 29)

### Phase 5 — Meta-Crate & Macros (In Progress)
- [ ] `axum-pk`: Meta-crate that re-exports all plugins
- [ ] `axum-pk-macros`: `#[derive(DbModel)]`, `#[derive(ApiEndpoint)]`
- [ ] `App` builder: `.plugin()`, `.routes()`, `.run()` fluent API
- [ ] Frontend connector: OpenAPI → TypeScript client generation

### Phase 6 — CLI Tool
- [ ] `axum-pk-cli`: `new`, `db migrate`, `gen sdk`, `doctor`, `serve`
- [ ] Project scaffolding templates (basic, fullstack, api-only)
- [ ] Code generation for models, handlers, tests

### Phase 7 — Next.js Admin Dashboard
- [ ] Dashboard with plugin management UI
- [ ] Project monitoring (routes, DB status, Redis status)
- [ ] Model/schema visualizer
- [ ] Auth user management
- [ ] Settings/configuration editor

---

## 🚀 Week 3: Polish & Release (June 30 — July 4)

### Phase 8 — Examples & Integration Tests
- [ ] `user-management` example: full CRUD + auth
- [ ] `e-commerce` example: complete backend
- [ ] `realtime-chat` example: WebSocket
- [ ] End-to-end integration tests

### Phase 9 — Documentation
- [ ] Getting started guide
- [ ] Plugin development guide
- [ ] API reference
- [ ] Deployment guide

### Phase 10 — CI/CD & Release
- [ ] GitHub Actions: test, clippy, fmt, audit
- [ ] Release workflow
- [ ] crates.io publication
- [ ] v0.1.0 release

---

## Architecture

```
App::new()
  .plugin(ConfigPlugin::from_env()?)
  .plugin(DbPlugin::new().postgres(url).auto_migrate())
  .plugin(RedisPlugin::new(url))
  .plugin(AuthPlugin::new().jwt(secret).with_rbac())
  .plugin(ApiPlugin::new().open_api("/docs"))
  .routes(routes![health])
  .run("0.0.0.0:3000")
  .await
```

## Crate Dependency Graph

```
axum-pk (meta-crate)
├── axum-pk-core      ← Plugin trait, errors, types
├── axum-pk-macros    ← #[derive(DbModel)], #[derive(ApiEndpoint)]
├── axum-pk-db        ← Database (SQLx/SeaORM)
├── axum-pk-auth      ← JWT + RBAC + Sessions
├── axum-pk-api       ← Pagination, Filtering, OpenAPI
├── axum-pk-config    ← Config management
├── axum-pk-redis     ← Cache, Rate limiting
└── axum-pk-cli       ← CLI tool
```

## Plugin System

Every plugin implements:
```rust
#[async_trait]
impl Plugin for MyPlugin {
    fn name(&self) -> &'static str { "my-plugin" }
    fn dependencies(&self) -> Vec<&'static str> { vec!["axum-pk-core"] }
    async fn validate(&self, ctx: &PluginContext) -> Result<(), AppError> { Ok(()) }
    async fn initialize(&self, ctx: &PluginContext) -> Result<PluginOutput, AppError> { ... }
    async fn shutdown(&self) -> Result<(), AppError> { Ok(()) }
}
```

## Security Checklist

- [x] SQL injection: parameterized queries only (SQLx)
- [x] XSS: JSON responses, no raw HTML
- [x] CSRF: SameSite cookies + CORS
- [x] Brute force: Redis-backed rate limiting
- [x] Passwords: Argon2id hashing
- [x] JWT: Short-lived access tokens (15min) + refresh rotation (7day)
- [x] TLS: rustls support
- [x] Timing attacks: constant-time comparison
- [ ] Dependency audit: cargo-audit in CI

## Testing Strategy

- Unit tests: Every crate has inline `#[cfg(test)]` modules
- Integration tests: `tests/` directory with full app setup
- Doc tests: All public API examples are tested
- CI: `cargo test --workspace` must pass on every PR
