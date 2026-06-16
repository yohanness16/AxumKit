# 🦀 AXUMkit Integration Guide — Step by Step

> **How to integrate AXUMkit into YOUR project (Auth + DB only)**

---

## What is AXUMkit?

AXUMkit is a modular backend framework for Rust. You pick only the plugins you need:

| Plugin | What it does |
|--------|-------------|
| `axum-pk-auth` | JWT authentication, RBAC, password hashing |
| `axum-pk-db` | Database (PostgreSQL/MySQL/SQLite), migrations, repositories |
| `axum-pk-api` | Pagination, filtering, sorting, OpenAPI types |
| `axum-pk-config` | Layered configuration |
| `axum-pk-redis` | Cache, rate limiting, sessions |

**You only pay for what you use.** If you want Auth + DB only, you add only Auth + DB.

---

## Step 1: Create Your Project

```bash
cargo new my-app
cd my-app
```

---

## Step 2: Add AXUMkit to `Cargo.toml`

Add **only the plugins you need**. For Auth + DB:

```toml
[dependencies]
# AXUMkit meta-crate — pick your features
axum-pk = { git = "https://github.com/yohanness16/AxumKit.git", features = ["auth", "db", "api", "config"] }

# You also need these:
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter"] }
```

**Feature flags available:**
- `"auth"` — JWT + RBAC + Argon2 password hashing
- `"db"` — SQLx database + migrations + repository pattern
- `"api"` — Pagination, filtering, sorting
- `"config"` — Layered config (env > .env > files > defaults)
- `"redis"` — Cache, rate limiting, sessions
- `"full"` — All plugins at once

---

## Step 3: Define Your Models

Each struct represents a database table:

```rust
use serde::{Deserialize, Serialize};

// This becomes a "users" table in the database
#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: String,
    email: String,
    name: String,
    role: String,        // "admin" | "moderator" | "user"
    password_hash: String,
    created_at: String,
}

// This becomes a "posts" table
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Post {
    id: String,
    title: String,
    content: String,
    author_id: String,   // Foreign key → users.id
    published: bool,
    created_at: String,
}

// This becomes a "products" table
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Product {
    id: String,
    name: String,
    description: String,
    price: f64,
    category: String,
    in_stock: bool,
    created_at: String,
}
```

**In production with `#[derive(DbModel)]`**, AXUMkit auto-generates:
- Migration SQL: `CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR, ...)`
- Repository<User> with `.find_by_id()`, `.find_all()`, `.create()`, `.update()`, `.delete()`
- QueryBuilder for complex queries
- Input validators

---

## Step 4: Define API Request/Response Types

```rust
// ── Requests ──
#[derive(Deserialize)]
struct CreateUserRequest {
    email: String,
    name: String,
    password: String,
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Deserialize)]
struct CreatePostRequest {
    title: String,
    content: String,
    published: Option<bool>,
}

#[derive(Deserialize)]
struct PaginationParams {
    page: Option<u64>,
    per_page: Option<u64>,
    sort_by: Option<String>,
    sort_order: Option<String>,   // "asc" or "desc"
    search: Option<String>,
}

// ── Responses ──
#[derive(Serialize)]
struct AuthResponse {
    access_token: String,
    refresh_token: String,
    user: UserPublic,
}

// Public user (never expose password_hash!)
#[derive(Serialize)]
struct UserPublic {
    id: String,
    email: String,
    name: String,
    role: String,
    created_at: String,
}

#[derive(Serialize)]
struct PaginatedResponse<T: Serialize> {
    data: Vec<T>,
    meta: PaginationMeta,
}

#[derive(Serialize)]
struct PaginationMeta {
    current_page: u64,
    per_page: u64,
    total_items: u64,
    total_pages: u64,
}
```

---

## Step 5: Create Your App State

```rust
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

struct AppState {
    users: Mutex<HashMap<String, User>>,
    posts: Mutex<HashMap<String, Post>>,
    products: Mutex<HashMap<String, Product>>,

    // ── In production, AXUMkit provides these:
    // db_pool: axum_pk_db::DbPool,           // SQLx connection pool
    // jwt_service: axum_pk_auth::JwtService, // JWT token service
    // cache: axum_pk_redis::CacheService,    // Redis cache (if using redis)
    // rate_limiter: axum_pk_redis::RateLimiter,
}

let state = Arc::new(AppState {
    users: Mutex::new(HashMap::new()),
    posts: Mutex::new(HashMap::new()),
    products: Mutex::new(HashMap::new()),
});
```

---

## Step 6: Create Your Handlers

### Auth Handlers (register/login)

```rust
use axum::extract::{Json, State};
use axum::http::StatusCode;
use uuid::Uuid;

async fn register(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateUserRequest>,
) -> Result<impl axum::response::IntoResponse, StatusCode> {
    let id = Uuid::new_v4().to_string();

    let user = User {
        id: id.clone(),
        email: req.email,
        name: req.name,
        role: "user".to_string(),
        // In production, use axum-pk-auth:
        // let password_hash = PasswordService::hash(&req.password).await?;
        password_hash: format!("hashed_{}", req.password),
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    state.users.lock().unwrap().insert(id.clone(), user);

    let public = UserPublic {
        id: id.clone(),
        email: req.email,
        name: req.name,
        role: "user".to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    Ok((StatusCode::CREATED, Json(AuthResponse {
        access_token: format!("jwt_access_{}", id),
        refresh_token: format!("jwt_refresh_{}", id),
        user: public,
    })))
}

async fn login(
    State(state): State<Arc<AppState>>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let users = state.users.lock().unwrap();
    let user = users
        .values()
        .find(|u| u.email == req.email)
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // In production, use axum-pk-auth:
    // PasswordService::verify(&req.password, &user.password_hash).await?;
    if user.password_hash != format!("hashed_{}", req.password) {
        return Err(StatusCode::UNAUTHORIZED);
    }

    Ok(Json(AuthResponse {
        access_token: format!("jwt_access_{}", user.id),
        refresh_token: format!("jwt_refresh_{}", user.id),
        user: UserPublic {
            id: user.id.clone(),
            email: user.email.clone(),
            name: user.name.clone(),
            role: user.role.clone(),
            created_at: user.created_at.clone(),
        },
    }))
}
```

### CRUD Handlers with Pagination

```rust
use axum::extract::{Path, Query, Router};

async fn list_users(
    State(state): State<Arc<AppState>>,
    Query(params): Query<PaginationParams>,
) -> Json<PaginatedResponse<UserPublic>> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);

    let mut users: Vec<UserPublic> = state
        .users
        .lock()
        .unwrap()
        .values()
        .map(|u| UserPublic {
            id: u.id.clone(),
            email: u.email.clone(),
            name: u.name.clone(),
            role: u.role.clone(),
            created_at: u.created_at.clone(),
        })
        .collect();

    // Sort
    if let Some(ref sort_by) = params.sort_by {
        match sort_by.as_str() {
            "name" => users.sort_by(|a, b| a.name.cmp(&b.name)),
            "email" => users.sort_by(|a, b| a.email.cmp(&b.email)),
            _ => {}
        }
    }
    if params.sort_order.as_deref() == Some("desc") {
        users.reverse();
    }

    // Search
    if let Some(ref search) = params.search {
        let s = search.to_lowercase();
        users.retain(|u| {
            u.name.to_lowercase().contains(&s)
                || u.email.to_lowercase().contains(&s)
        });
    }

    // Paginate
    let total = users.len() as u64;
    let total_pages = (total + per_page - 1) / per_page;
    let start = ((page - 1) * per_page) as usize;
    let end = (start + per_page as usize).min(users.len());

    Json(PaginatedResponse {
        data: if start < users.len() { users[start..end].to_vec() } else { vec![] },
        meta: PaginationMeta {
            current_page: page,
            per_page,
            total_items: total,
            total_pages,
        },
    })
}

async fn get_user(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<UserPublic>, StatusCode> {
    state.users.lock().unwrap().get(&id)
        .map(|u| Json(UserPublic {
            id: u.id.clone(),
            email: u.email.clone(),
            name: u.name.clone(),
            role: u.role.clone(),
            created_at: u.created_at.clone(),
        }))
        .ok_or(StatusCode::NOT_FOUND)
}
```

Product CRUD follows the same pattern — see `examples/my-project/src/main.rs` for full code.

---

## Step 7: Wire Everything Together

```rust
use axum::routing::{get, post, put, delete};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .init();

    let state = Arc::new(AppState {
        users: Mutex::new(HashMap::new()),
        posts: Mutex::new(HashMap::new()),
        products: Mutex::new(HashMap::new()),
    });

    let app = Router::new()
        // Auth (public)
        .route("/api/v1/auth/register", post(register))
        .route("/api/v1/auth/login", post(login))

        // Users
        .route("/api/v1/users", get(list_users))
        .route("/api/v1/users/:id", get(get_user))

        // Posts (CRUD)
        .route("/api/v1/posts", get(list_posts).post(create_post))
        .route("/api/v1/posts/:id", get(get_post).put(update_post).delete(delete_post))

        // Products (CRUD)
        .route("/api/v1/products", get(list_products).post(create_product))
        .route("/api/v1/products/:id", get(get_product).put(update_product).delete(delete_product))

        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("Running on http://0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}
```

---

## Step 8: Run It

```bash
cargo run
```

Test the API:
```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","name":"John","password":"secret123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'

# List users (paginated)
curl "http://localhost:3000/api/v1/users?page=1&per_page=10&sort_by=name&search=john"

# Create product
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Widget","description":"A widget","price":9.99,"category":"tools"}'

# List products (sorted by price descending)
curl "http://localhost:3000/api/v1/products?sort_by=price&sort_order=desc"
```

---

## What AXUMkit Provides vs What You Write

### What YOU write:
- ✅ Your models (structs)
- ✅ Your API request/response types
- ✅ Your handler functions
- ✅ Your route definitions
- ✅ Your business logic

### What AXUMkit provides:
- 🔌 **Plugin system** — pick only the plugins you need
- 🔌 **Auth plugin** — JWT tokens, password hashing (Argon2id), RBAC
- 🔌 **DB plugin** — Database connections, migrations, repository pattern
- 🔌 **API plugin** — Pagination, sorting, filtering types
- 🔌 **Config plugin** — Layered configuration (env > .env > files > defaults)
- 🔌 **Redis plugin** — Cache, rate limiting, sessions
- 🔌 **App builder** — `.plugin()`, `.routes()`, `.run()` with graceful shutdown
- 🔌 **Error handling** — Unified `AppError` with HTTP status mapping
- 🔌 **Middleware** — CORS, compression, tracing, rate limiting
- 🔌 **CLI** — `axum-pk new`, `db migrate`, `gen sdk`, `doctor`
- 🔌 **Dashboard** — Next.js admin panel for monitoring

### In production, AXUMkit also auto-generates:
- 🗄️ Database migrations from your models (via `#[derive(DbModel)]`)
- 🗄️ CRUD repositories (via `Repository<User>` trait)
- 🔐 Auth middleware (JWT validation on protected routes)
- 📖 OpenAPI/Swagger docs (via `#[derive(ApiEndpoint)]`)
- 📊 Frontend SDK (TypeScript client from OpenAPI spec)

---

## Database Setup (Production)

In production with the DB plugin:

```bash
# Install SQLx CLI
cargo install sqlx-cli

# Set database URL
export DATABASE_URL="postgres://user:pass@localhost/mydb"

# Create database
sqlx database create

# Create migration
sqlx migration add create_users_table
```

Migration file (`migrations/20240101000000_create_users_table.sql`):
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Then in main.rs:
```rust
App::new()
    .plugin(ConfigPlugin::from_env()?)
    .plugin(DbPlugin::new()
        .postgres("postgres://user:pass@localhost/mydb")
        .auto_migrate(true)
        .pool_size(16))
    .plugin(AuthPlugin::new()
        .jwt_secret("your-secret-key")
        .with_rbac())
    .run("0.0.0.0:3000")
    .await
```

---

## File Structure

```
my-app/
├── Cargo.toml
├── config/
│   ├── default.toml          # Default config values
│   ├── development.toml      # Dev overrides
│   └── production.toml       # Prod overrides
├── migrations/               # SQL migration files
│   ├── 20240101000000_create_users_table.sql
│   └── 20240101000001_create_posts_table.sql
├── src/
│   ├── main.rs               # App entry point + route wiring
│   ├── models/               # Your data models
│   │   ├── mod.rs
│   │   ├── user.rs
│   │   ├── post.rs
│   │   └── product.rs
│   ├── handlers/             # API endpoint handlers
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   ├── users.rs
│   │   ├── posts.rs
│   │   └── products.rs
│   ├── services/             # Business logic
│   │   ├── mod.rs
│   │   └── email.rs
│   └── state.rs              # App state shared across handlers
├── .env                      # Environment variables (gitignored)
└── .gitignore
```

---

## See It In Action

```bash
# Run the full walkthrough example
cd examples/my-project
cargo run
```

This runs a working server with:
- User registration + login
- Full CRUD for Users, Posts, Products
- Pagination, sorting, search on all list endpoints
- Role-based access control (ready for production)

---

## Next Steps

1. **Read the full example:** `examples/my-project/src/main.rs`
2. **Read the arch plan:** `Axum_Plugin_Kits_Architecture_Blueprint.pdf`
3. **Browse the roadmap:** `TASKS.md`
4. **Check the dashboard:** `cd dashboard && npm run dev`
5. **Read crate docs:** `cargo doc --workspace --open`
