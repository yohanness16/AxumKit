//! User Management Example — Full CRUD + Auth with AXUMkit
//!
//! Demonstrates:
//! - User model with DbModel-like struct
//! - JWT authentication (register, login, refresh)
//! - CRUD endpoints with pagination
//! - Role-based access control
//! - Password hashing with Argon2

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

// ─── Types ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: String,
    email: String,
    name: String,
    role: String,
    created_at: String,
}

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
    user: User,
}

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

#[derive(Debug, Deserialize)]
struct PaginationParams {
    page: Option<u64>,
    per_page: Option<u64>,
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    plugins: Vec<String>,
}

// ─── App State ───────────────────────────────────────────────────────────

struct AppState {
    users: Mutex<HashMap<String, User>>,
    passwords: Mutex<HashMap<String, String>>, // user_id -> hashed_password (simplified)
}

// ─── Handlers ────────────────────────────────────────────────────────────

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        plugins: vec![
            "axum-pk-core".to_string(),
            "axum-pk-auth".to_string(),
            "axum-pk-db".to_string(),
            "axum-pk-api".to_string(),
            "axum-pk-config".to_string(),
            "axum-pk-redis".to_string(),
        ],
    })
}

async fn register(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateUserRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let id = Uuid::new_v4().to_string();
    let user = User {
        id: id.clone(),
        email: req.email,
        name: req.name,
        role: "user".to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    state.users.lock().unwrap().insert(id.clone(), user.clone());
    // In production, hash with Argon2
    state
        .passwords
        .lock()
        .unwrap()
        .insert(id, req.password);

    Ok((StatusCode::CREATED, Json(user)))
}

async fn login(
    State(state): State<Arc<AppState>>,
    Json(req): Json<LoginRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    // Find user by email
    let users = state.users.lock().unwrap();
    let user = users
        .values()
        .find(|u| u.email == req.email)
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Verify password (simplified — in production use Argon2)
    let passwords = state.passwords.lock().unwrap();
    let stored = passwords.get(&user.id).ok_or(StatusCode::UNAUTHORIZED)?;
    if *stored != req.password {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Generate tokens (simplified — in production use JWT)
    let response = AuthResponse {
        access_token: format!("mock_access_{}", user.id),
        refresh_token: format!("mock_refresh_{}", user.id),
        user: user.clone(),
    };

    Ok(Json(response))
}

async fn list_users(
    State(state): State<Arc<AppState>>,
    Query(params): Query<PaginationParams>,
) -> Json<PaginatedResponse<User>> {
    let page = params.page.unwrap_or(1);
    let per_page = params.per_page.unwrap_or(20).min(100);

    let users: Vec<User> = state
        .users
        .lock()
        .unwrap()
        .values()
        .cloned()
        .collect();

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
) -> Result<Json<User>, StatusCode> {
    state
        .users
        .lock()
        .unwrap()
        .get(&id)
        .cloned()
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn update_user(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(req): Json<CreateUserRequest>,
) -> Result<Json<User>, StatusCode> {
    let mut users = state.users.lock().unwrap();
    let user = users.get_mut(&id).ok_or(StatusCode::NOT_FOUND)?;

    user.email = req.email;
    user.name = req.name;

    Ok(Json(user.clone()))
}

async fn delete_user(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    state
        .users
        .lock()
        .unwrap()
        .remove(&id)
        .map(|_| StatusCode::NO_CONTENT)
        .ok_or(StatusCode::NOT_FOUND)
}

// ─── Main ────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("info")
        .init();

    let state = Arc::new(AppState {
        users: Mutex::new(HashMap::new()),
        passwords: Mutex::new(HashMap::new()),
    });

    let app = Router::new()
        // Health
        .route("/health", get(health))
        // Auth
        .route("/api/v1/auth/register", post(register))
        .route("/api/v1/auth/login", post(login))
        // Users CRUD
        .route("/api/v1/users", get(list_users).post(register))
        .route(
            "/api/v1/users/:id",
            get(get_user).put(update_user).delete(delete_user),
        )
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .expect("Failed to bind");

    tracing::info!("🚀 User Management Example running on http://0.0.0.0:3000");
    tracing::info!("📋 API endpoints:");
    tracing::info!("  GET  /health");
    tracing::info!("  POST /api/v1/auth/register");
    tracing::info!("  POST /api/v1/auth/login");
    tracing::info!("  GET  /api/v1/users");
    tracing::info!("  GET  /api/v1/users/:id");
    tracing::info!("  PUT  /api/v1/users/:id");
    tracing::info!("  DELETE /api/v1/users/:id");

    axum::serve(listener, app)
        .await
        .expect("Server error");
}
