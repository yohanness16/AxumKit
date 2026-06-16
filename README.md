# 🦀 AXUMkit — Modular, Pluggable Rust Backend Framework

> **Define your models. Pick your plugins. Ship your backend.**

AXUMkit is a modular backend framework built on [Axum](https://github.com/tokio-rs/axum) and [Tokio](https://tokio.rs/), designed for developers who want to `cargo add` only what they need and ship fast — without sacrificing Rust's safety guarantees.

## Quick Start

```bash
# Create a new project
cargo install axum-pk-cli
axum-pk new my-app
cd my-app
cargo run
```

## Architecture

```
axum-pk (meta-crate)
├── axum-pk-core      ← Plugin trait, errors, types  (always included)
├── axum-pk-config    ← Layered configuration        [feature: config]
├── axum-pk-db        ← Database (SQLx) + migrations [feature: db]
├── axum-pk-auth      ← JWT + RBAC + Sessions        [feature: auth]
├── axum-pk-api       ← Pagination, OpenAPI, WebSocket [feature: api]
├── axum-pk-redis     ← Cache, rate limiting         [feature: redis]
└── axum-pk-cli       ← Scaffolding CLI              [binary]
```

## Plugin System

Every plugin implements a simple trait:

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

## Example

```rust
use axum_pk::prelude::*;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    App::new()
        .run("0.0.0.0:3000")
        .await
}
```

## Features

| Plugin | What it does | Crate |
|--------|-------------|-------|
| **Core** | Plugin trait, unified errors, shared types | `axum-pk-core` |
| **Config** | Layered config (env > .env > files > defaults) | `axum-pk-config` |
| **Database** | SQLx backend, migrations, repository pattern | `axum-pk-db` |
| **Auth** | JWT (HS256/RS256), RBAC hierarchy, Argon2 passwords | `axum-pk-auth` |
| **API** | Pagination, filtering, OpenAPI types, WebSocket | `axum-pk-api` |
| **Redis** | Cache, rate limiting, sessions, pub/sub | `axum-pk-redis` |
| **CLI** | `axum-pk new`, `db migrate`, `gen sdk`, `doctor` | `axum-pk-cli` |
| **Dashboard** | Next.js admin panel for monitoring & management | `dashboard/` |

## Security

- **SQL Injection**: Compile-time checked queries via SQLx
- **XSS**: JSON responses only, no raw HTML
- **CSRF**: SameSite cookies + CORS + server-side rendering
- **Passwords**: Argon2id hashing with OWASP parameters
- **JWT**: Short-lived access tokens (15 min) + refresh rotation (7 days)
- **Rate Limiting**: Redis-backed sliding window algorithm
- **TLS**: rustls support via axum-server

## Dashboard

AXUMkit includes a Next.js admin dashboard for monitoring your application:

```bash
cd dashboard
npm install
npm run dev
```

The dashboard provides:
- **Overview**: Plugin status, routes, uptime, health checks
- **Plugin Manager**: Enable/disable plugins, view dependencies
- **Data Models**: Visual schema editor, field management
- **Monitoring**: Request metrics, response times, error rates, logs
- **Settings**: Configuration editor for all plugins

## Testing

```bash
# Run all tests
cargo test --workspace

# Run tests for a specific crate
cargo test -p axum-pk-auth
```

Current test coverage:
- `axum-pk-core`: 19 tests (types, errors, plugin registry)
- `axum-pk-db`: 17 tests (config, errors, migrations)
- `axum-pk-auth`: 13 tests (JWT, passwords, RBAC)
- `axum-pk-api`: 20 tests (pagination, sorting, filtering)
- `axum-pk-config`: 3 tests (builder, config loading)
- `axum-pk-redis`: 15 tests (errors, config, rate limiter)

## Roadmap

See [TASKS.md](./TASKS.md) for the full 3-week implementation plan.

## License

MIT OR Apache-2.0

## Contributing

Contributions welcome! Please read the guide in `docs/CONTRIBUTING.md` (coming soon).
