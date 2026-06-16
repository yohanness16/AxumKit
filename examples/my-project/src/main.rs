//! # AXUMkit Integration Walkthrough
//!
//! This example shows how to integrate AXUMkit into YOUR project.
//! We only use: Auth + DB + API + Config plugins.
//!
//! ## Step 1: Add AXUMkit to your Cargo.toml
//!
//! ```toml
//! [dependencies]
//! axum-pk = { git = "https://github.com/yohanness16/AxumKit.git", features = ["auth", "db", "api", "config"] }
//! tokio = { version = "1", features = ["full"] }
//! serde = { version = "1", features = ["derive"] }
//! ```
//!
//! ## Step 2: Define your models (the structs that become DB tables)
//!
//! ## Step 3: Create your handlers (the API endpoints)
//!
//! ## Step 4: Wire everything together in main()

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, put, delete},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2: DEFINE YOUR MODELS
// ═══════════════════════════════════════════════════════════════════════════
//
// Each struct represents a database table.
// In production, the #[derive(DbModel)] macro would auto-generate:
//   - Migration SQL (CREATE TABLE)
//   - Repository<T> with CRUD methods
//   - QueryBuilder for complex queries
//   - Validators
//
// For now, we define them manually:

/// User model — becomes a "users" table in the database
#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: String,
    email: String,
    name: String,
    role: String,        // "admin" | "moderator" | "user"
    password_hash: String,
    created_at: String,
}

/// Post model — becomes a "posts" table
/// Has a foreign key to User (author_id)
#[derive(Debug, Clone, Serialize, Deserialize)]
struct Post {
    id: String,
    title: String,
    content: String,
    author_id: String,   // Foreign key → users.id
    published: bool,
    created_at: String,
}

/// Product model — becomes a "products" table
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

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2b: DEFINE YOUR API REQUEST/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

#[derive(Debug, Deserialize)]
struct CreateUserRequest {
    email: String,
    name: String,
    password: String,
}

#[derive(Debug, Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Debug, Serialize)]
struct AuthResponse {
    access_token: String,
    refresh_token: String,
    user: UserPublic,
}

/// Public user data (never expose password_hash)
#[derive(Debug, Serialize, Clone)]
struct UserPublic {
    id: String,
    email: String,
    name: String,
    role: String,
    created_at: String,
}

#[derive(Debug, Deserialize)]
struct CreatePostRequest {
    title: String,
    content: String,
    published: Option<bool>,
}

#[derive(Debug, Deserialize)]
struct CreateProductRequest {
    name: String,
    description: String,
    price: f64,
    category: String,
}

#[derive(Debug, Deserialize)]
struct UpdateProductRequest {
    name: Option<String>,
    description: Option<String>,
    price: Option<f64>,
    category: Option<String>,
    in_stock: Option<bool>,
}

// Pagination query parameters
#[derive(Debug, Deserialize)]
struct PaginationParams {
    page: Option<u64>,
    per_page: Option<u64>,
    sort_by: Option<String>,     // "created_at", "name", "price"
    sort_order: Option<String>,  // "asc" or "desc"
    search: Option<String>,      // search by name/title
}

// Paginated response
#[derive(Debug, Serialize)]
struct PaginatedResponse<T: Serialize> {
    data: Vec<T>,
    meta: PaginationMeta,
}

#[derive(Debug, Serialize)]
struct PaginationMeta {
    current_page: u64,
    per_page: u64,
    total_items: u64,
    total_pages: u64,
}

// Health & info
#[derive(Debug, Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    plugins: Vec<String>,
    database: String,
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2c: DEFINE YOUR APP STATE (shared across all handlers)
// ═══════════════════════════════════════════════════════════════════════════
//
// In production, this would hold:
//   - Database connection pool (from axum-pk-db)
//   - Redis connection pool (from axum-pk-redis)
//   - JWT service (from axum-pk-auth)
//   - Cache service (from axum-pk-redis)
//
// For this example, we use in-memory HashMaps:

struct AppState {
    users: Mutex<HashMap<String, User>>,
    posts: Mutex<HashMap<String, Post>>,
    products: Mutex<HashMap<String, Product>>,
    // In production, these come from AXUMkit plugins:
    // db_pool: axum_pk_db::DbPool,
    // jwt_service: axum_pk_auth::JwtService,
    // cache: axum_pk_redis::CacheService,
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3: CREATE YOUR HANDLERS (API endpoints)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Health Check ─────────────────────────────────────────────────────────

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        plugins: vec![
            "axum-pk-auth (JWT + RBAC)".to_string(),
            "axum-pk-db (SQLx + Migrations)".to_string(),
            "axum-pk-api (Pagination + Filtering)".to_string(),
            "axum-pk-config (Layered Config)".to_string(),
        ],
        database: "PostgreSQL (via SQLx)".to_string(),
    })
}

// ─── Auth Handlers ───────────────────────────────────────────────────────
//
// In production, axum-pk-auth provides:
//   - JwtService::generate_token() / verify_token()
//   - PasswordService::hash() / verify() (Argon2id)
//   - Auth middleware that extracts & validates JWT from Authorization header
//   - Role-based access control (RBAC)
//
// Here we simulate the auth flow:

async fn register(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateUserRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    // ── In production, AXUMkit does this for you:
    // let password_hash = PasswordService::hash(&req.password).await?;
    // let user = repo.create(&NewUser { email, name, password_hash }).await?;
    // let token = JwtService::generate_token(&user).await?;

    let id = Uuid::new_v4().to_string();
    let user = User {
        id: id.clone(),
        email: req.email.clone(),
        name: req.name.clone(),
        role: "user".to_string(),
        // In production: hash with Argon2id via axum-pk-auth
        password_hash: format!("hashed_{}", req.password),
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    let public = UserPublic {
        id: user.id.clone(),
        email: user.email.clone(),
        name: user.name.clone(),
        role: user.role.clone(),
        created_at: user.created_at.clone(),
    };

    let id_clone = id.clone();
    state.users.lock().unwrap().insert(id, user);

    // In production: generate real JWT via axum-pk-auth
    let response = AuthResponse {
        access_token: format!("jwt_access_{}", id_clone),
        refresh_token: format!("jwt_refresh_{}", id_clone),
        user: public,
    };

    Ok((StatusCode::CREATED, Json(response)))
}

async fn login(
    State(state): State<Arc<AppState>>,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    // ── In production, AXUMkit does this:
    // let user = repo.find_by_email(&req.email).await?;
    // PasswordService::verify(&req.password, &user.password_hash).await?;
    // let token = JwtService::generate_token(&Claims {
    //     sub: user.id, roles: vec![user.role], ...
    // }).await?;

    let users = state.users.lock().unwrap();
    let user = users
        .values()
        .find(|u| u.email == req.email)
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // In production: verify with Argon2id
    if user.password_hash != format!("hashed_{}", req.password) {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let public = UserPublic {
        id: user.id.clone(),
        email: user.email.clone(),
        name: user.name.clone(),
        role: user.role.clone(),
        created_at: user.created_at.clone(),
    };

    Ok(Json(AuthResponse {
        access_token: format!("jwt_access_{}", public.id),
        refresh_token: format!("jwt_refresh_{}", public.id),
        user: public,
    }))
}

// ─── User Handlers (CRUD) ────────────────────────────────────────────────

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
            _ => {} // default: by created_at (insertion order)
        }
    }
    if params.sort_order.as_deref() == Some("desc") {
        users.reverse();
    }

    // Search
    if let Some(ref search) = params.search {
        let search_lower = search.to_lowercase();
        users.retain(|u| {
            u.name.to_lowercase().contains(&search_lower)
                || u.email.to_lowercase().contains(&search_lower)
        });
    }

    // Paginate
    let total = users.len() as u64;
    let total_pages = (total + per_page - 1) / per_page;
    let start = ((page - 1) * per_page) as usize;
    let end = (start + per_page as usize).min(users.len());
    let data = if start < users.len() {
        users[start..end].to_vec()
    } else {
        vec![]
    };

    Json(PaginatedResponse {
        data,
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
    state
        .users
        .lock()
        .unwrap()
        .get(&id)
        .map(|u| {
            Json(UserPublic {
                id: u.id.clone(),
                email: u.email.clone(),
                name: u.name.clone(),
                role: u.role.clone(),
                created_at: u.created_at.clone(),
            })
        })
        .ok_or(StatusCode::NOT_FOUND)
}

// ─── Post Handlers (CRUD) ────────────────────────────────────────────────

async fn create_post(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreatePostRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    // ── In production, extract user_id from JWT:
    // let claims = RequireAuth::from_request_parts(&mut parts, &state).await?;
    // let author_id = claims.sub;

    let id = Uuid::new_v4().to_string();
    let post = Post {
        id: id.clone(),
        title: req.title,
        content: req.content,
        author_id: "current_user_id".to_string(), // From JWT in production
        published: req.published.unwrap_or(false),
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    state.posts.lock().unwrap().insert(id, post.clone());
    Ok((StatusCode::CREATED, Json(post)))
}

async fn list_posts(
    State(state): State<Arc<AppState>>,
    Query(params): Query<PaginationParams>,
) -> Json<PaginatedResponse<Post>> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);

    let mut posts: Vec<Post> = state
        .posts
        .lock()
        .unwrap()
        .values()
        .filter(|p| p.published) // Only show published posts
        .cloned()
        .collect();

    // Sort by created_at descending (newest first)
    posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));

    // Search
    if let Some(ref search) = params.search {
        let s = search.to_lowercase();
        posts.retain(|p| {
            p.title.to_lowercase().contains(&s)
                || p.content.to_lowercase().contains(&s)
        });
    }

    let total = posts.len() as u64;
    let total_pages = (total + per_page - 1) / per_page;
    let start = ((page - 1) * per_page) as usize;
    let end = (start + per_page as usize).min(posts.len());

    Json(PaginatedResponse {
        data: if start < posts.len() {
            posts[start..end].to_vec()
        } else {
            vec![]
        },
        meta: PaginationMeta {
            current_page: page,
            per_page,
            total_items: total,
            total_pages,
        },
    })
}

async fn get_post(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<Post>, StatusCode> {
    state
        .posts
        .lock()
        .unwrap()
        .get(&id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn update_post(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(req): Json<CreatePostRequest>,
) -> Result<Json<Post>, StatusCode> {
    // ── In production, check authorization:
    // RequirePermission("posts.write").check(&claims).await?;
    // Or for own posts only: RequirePermission("posts.write_own").check(&claims).await?;

    let mut posts = state.posts.lock().unwrap();
    let post = posts.get_mut(&id).ok_or(StatusCode::NOT_FOUND)?;

    post.title = req.title;
    post.content = req.content;
    post.published = req.published.unwrap_or(post.published);

    Ok(Json(post.clone()))
}

async fn delete_post(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    state
        .posts
        .lock()
        .unwrap()
        .remove(&id)
        .map(|_| StatusCode::NO_CONTENT)
        .ok_or(StatusCode::NOT_FOUND)
}

// ─── Product Handlers (CRUD) ─────────────────────────────────────────────

async fn create_product(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateProductRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    // ── In production, require admin role:
    // RequireRole::Admin.check(&claims).await?;

    let id = Uuid::new_v4().to_string();
    let product = Product {
        id: id.clone(),
        name: req.name,
        description: req.description,
        price: req.price,
        category: req.category,
        in_stock: true,
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    state.products.lock().unwrap().insert(id, product.clone());
    Ok((StatusCode::CREATED, Json(product)))
}

async fn list_products(
    State(state): State<Arc<AppState>>,
    Query(params): Query<PaginationParams>,
) -> Json<PaginatedResponse<Product>> {
    let page = params.page.unwrap_or(1).max(1);
    let per_page = params.per_page.unwrap_or(20).clamp(1, 100);

    let mut products: Vec<Product> = state
        .products
        .lock()
        .unwrap()
        .values()
        .cloned()
        .collect();

    // Sort
    if let Some(ref sort_by) = params.sort_by {
        match sort_by.as_str() {
            "name" => products.sort_by(|a, b| a.name.cmp(&b.name)),
            "price" => products.sort_by(|a, b| a.price.partial_cmp(&b.price).unwrap()),
            "category" => products.sort_by(|a, b| a.category.cmp(&b.category)),
            _ => {}
        }
    }
    if params.sort_order.as_deref() == Some("desc") {
        products.reverse();
    }

    // Search
    if let Some(ref search) = params.search {
        let s = search.to_lowercase();
        products.retain(|p| {
            p.name.to_lowercase().contains(&s)
                || p.category.to_lowercase().contains(&s)
        });
    }

    let total = products.len() as u64;
    let total_pages = (total + per_page - 1) / per_page;
    let start = ((page - 1) * per_page) as usize;
    let end = (start + per_page as usize).min(products.len());

    Json(PaginatedResponse {
        data: if start < products.len() {
            products[start..end].to_vec()
        } else {
            vec![]
        },
        meta: PaginationMeta {
            current_page: page,
            per_page,
            total_items: total,
            total_pages,
        },
    })
}

async fn get_product(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<Json<Product>, StatusCode> {
    state
        .products
        .lock()
        .unwrap()
        .get(&id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn update_product(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(req): Json<UpdateProductRequest>,
) -> Result<Json<Product>, StatusCode> {
    let mut products = state.products.lock().unwrap();
    let product = products.get_mut(&id).ok_or(StatusCode::NOT_FOUND)?;

    if let Some(name) = req.name { product.name = name; }
    if let Some(desc) = req.description { product.description = desc; }
    if let Some(price) = req.price { product.price = price; }
    if let Some(cat) = req.category { product.category = cat; }
    if let Some(stock) = req.in_stock { product.in_stock = stock; }

    Ok(Json(product.clone()))
}

async fn delete_product(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    state
        .products
        .lock()
        .unwrap()
        .remove(&id)
        .map(|_| StatusCode::NO_CONTENT)
        .ok_or(StatusCode::NOT_FOUND)
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4: WIRE EVERYTHING TOGETHER
// ═══════════════════════════════════════════════════════════════════════════
//
// In production with AXUMkit, you would do:
//
//   App::new()
//     .plugin(ConfigPlugin::from_env()?)
//     .plugin(DbPlugin::new()
//       .postgres("postgres://localhost/mydb")
//       .auto_migrate(true)
//       .pool_size(16))
//     .plugin(AuthPlugin::new()
//       .jwt_secret("your-secret")
//       .with_rbac())
//     .plugin(ApiPlugin::new()
//       .open_api("/docs"))
//     .run("0.0.0.0:3000")
//     .await
//
// This auto-generates:
//   - Database tables from your models
//   - CRUD repositories
//   - Auth middleware (JWT validation on protected routes)
//   - OpenAPI/Swagger docs at /docs
//   - Health checks at /health
//   - Rate limiting
//   - CORS, compression, tracing middleware

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .with_target(false)
        .init();

    // Create shared state
    // In production, AXUMkit plugins provide:
    //   - db_pool: SQLx connection pool (PostgreSQL/MySQL/SQLite)
    //   - jwt_service: JWT token generation/verification
    //   - cache: Redis cache service
    //   - rate_limiter: Redis-backed rate limiter
    let state = Arc::new(AppState {
        users: Mutex::new(HashMap::new()),
        posts: Mutex::new(HashMap::new()),
        products: Mutex::new(HashMap::new()),
    });

    // Build the router
    // In production, AXUMkit adds:
    //   - CORS middleware
    //   - Compression middleware
    //   - Tracing middleware
    //   - Rate limiting middleware
    //   - Auth middleware (on protected routes)
    let app = Router::new()
        // ── Health ──
        .route("/health", get(health))

        // ── Auth (public) ──
        .route("/api/v1/auth/register", post(register))
        .route("/api/v1/auth/login", post(login))

        // ── Users (protected in production) ──
        .route("/api/v1/users", get(list_users))
        .route("/api/v1/users/:id", get(get_user))

        // ── Posts (CRUD) ──
        .route("/api/v1/posts", get(list_posts).post(create_post))
        .route(
            "/api/v1/posts/:id",
            get(get_post).put(update_post).delete(delete_post),
        )

        // ── Products (CRUD) ──
        .route("/api/v1/products", get(list_products).post(create_product))
        .route(
            "/api/v1/products/:id",
            get(get_product).put(update_product).delete(delete_product),
        )

        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .expect("Failed to bind to port 3000");

    // ── Print API documentation ──
    println!("\n🚀 AXUMkit Example — Running on http://0.0.0.0:3000\n");
    println!("📋 API Endpoints:");
    println!("  ── Health ──────────────────────────");
    println!("  GET  /health                    → Health check + plugin info");
    println!("  ── Auth (Public) ──────────────────");
    println!("  POST /api/v1/auth/register      → Register new user");
    println!("  POST /api/v1/auth/login         → Login, get JWT tokens");
    println!("  ── Users ──────────────────────────");
    println!("  GET  /api/v1/users              → List users (paginated)");
    println!("  GET  /api/v1/users/:id          → Get user by ID");
    println!("  ── Posts (CRUD) ───────────────────");
    println!("  GET  /api/v1/posts              → List posts (paginated, filtered)");
    println!("  POST /api/v1/posts              → Create post");
    println!("  GET  /api/v1/posts/:id          → Get post by ID");
    println!("  PUT  /api/v1/posts/:id          → Update post");
    println!("  DELETE /api/v1/posts/:id        → Delete post");
    println!("  ── Products (CRUD) ────────────────");
    println!("  GET  /api/v1/products           → List products (paginated, sorted)");
    println!("  POST /api/v1/products           → Create product");
    println!("  GET  /api/v1/products/:id       → Get product by ID");
    println!("  PUT  /api/v1/products/:id       → Update product");
    println!("  DELETE /api/v1/products/:id     → Delete product");
    println!("\n📖 Query Parameters (on list endpoints):");
    println!("  ?page=1&per_page=20              → Pagination");
    println!("  ?sort_by=price&sort_order=desc   → Sorting");
    println!("  ?search=keyword                  → Search by name/title");
    println!("\n🔧 Plugins Used:");
    println!("  ✓ axum-pk-auth   — JWT + RBAC + Argon2 password hashing");
    println!("  ✓ axum-pk-db     — SQLx + PostgreSQL + migrations");
    println!("  ✓ axum-pk-api    — Pagination, filtering, OpenAPI types");
    println!("  ✓ axum-pk-config — Layered configuration");
    println!();

    axum::serve(listener, app)
        .await
        .expect("Server error");
}
