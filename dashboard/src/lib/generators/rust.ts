import type { Model, Field, FieldType } from "@/types";

function mapFieldTypeToRust(type: FieldType): string {
  const map: Record<FieldType, string> = {
    string: "String",
    integer: "i32",
    float: "f64",
    boolean: "bool",
    datetime: "chrono::DateTime<chrono::Utc>",
    uuid: "uuid::Uuid",
    text: "String",
    json: "serde_json::Value",
    enum: "String",
  };
  return map[type] || "String";
}

export function generateModelCode(model: Model): string {
  const lines: string[] = [
    "use serde::{Deserialize, Serialize};",
    "use sqlx::FromRow;",
    "",
    `#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]`,
    `pub struct ${model.name} {`,
  ];

  for (const field of model.fields) {
    let rustType = mapFieldTypeToRust(field.type);
    if (field.nullable) {
      rustType = `Option<${rustType}>`;
    }
    if (field.hidden) {
      lines.push(`    #[serde(skip_serializing)]`);
    }
    lines.push(`    pub ${field.name}: ${rustType},`);
  }

  lines.push("}");
  lines.push("");

  // Generate Create DTO
  lines.push(`#[derive(Debug, Deserialize)]`);
  lines.push(`pub struct Create${model.name}Dto {`);
  for (const field of model.fields) {
    if (field.name === "id" || field.name === "created_at" || field.name === "updated_at") continue;
    const rustType = mapFieldTypeToRust(field.type);
    if (field.nullable) {
      lines.push(`    pub ${field.name}: Option<${rustType}>,`);
    } else {
      lines.push(`    pub ${field.name}: ${rustType},`);
    }
  }
  lines.push("}");

  return lines.join("\n");
}

export function generateHandlerCode(model: Model): string {
  const name = model.name;
  const tableName = model.tableName;
  const path = `/${tableName}`;

  return `use axum::{extract::{Path, Query, State}, Json};
use serde::Deserialize;
use uuid::Uuid;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct Pagination {
    page: Option<i64>,
    per_page: Option<i64>,
}

pub async fn list_${tableName}(
    State(state): State<AppState>,
    Query(pagination): Query<Pagination>,
) -> Json<Vec<${name}>> {
    let page = pagination.page.unwrap_or(1);
    let per_page = pagination.per_page.unwrap_or(20);
    let offset = (page - 1) * per_page;

    let items = sqlx::query_as::<_, ${name}>(
        "SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2"
    )
    .bind(per_page)
    .bind(offset)
    .fetch_all(&state.pool)
    .await
    .unwrap_or_default();

    Json(items)
}

pub async fn get_${tableName.singular}(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Json<Option<${name}>> {
    let item = sqlx::query_as::<_, ${name}>(
        "SELECT * FROM ${tableName} WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.pool)
    .await
    .unwrap_or(None);

    Json(item)
}

pub async fn create_${tableName.singular}(
    State(state): State<AppState>,
    Json(dto): Json<Create${name}Dto>,
) -> Json<${name}> {
    // Implementation here
    todo!()
}

pub async fn update_${tableName.singular}(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
    Json(dto): Json<Create${name}Dto>,
) -> Json<Option<${name}>> {
    // Implementation here
    todo!()
}

pub async fn delete_${tableName.singular}(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> &'static str {
    sqlx::query("DELETE FROM ${tableName} WHERE id = $1")
        .bind(id)
        .execute(&state.pool)
        .await
        .ok();
    "Deleted"
}`.replace("${tableName.singular}", tableName.replace(/s$/, ""));
}

export function generateRouterCode(models: Model[]): string {
  const lines: string[] = [
    "use axum::Router;",
    "use super::handlers::*;",
    "",
    "pub fn create_router() -> Router<AppState> {",
    "    Router::new()",
  ];

  for (const model of models) {
    const path = model.tableName;
    lines.push(`        .route("/${path}", get(list_${path}).post(create_${path.replace(/s$/, "")}))`);
    lines.push(`        .route("/${path}/:id", get(get_${path.replace(/s$/, "")}).put(update_${path.replace(/s$/, "")}).delete(delete_${path.replace(/s$/, "")}))`);
  }

  lines.push("}");
  return lines.join("\n");
}

export function generateCargoToml(projectName: string): string {
  return `[package]
name = "${projectName}"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.7", features = ["runtime-tokio", "postgres", "uuid", "chrono"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
tower-http = { version = "0.5", features = ["cors", "trace"] }
tracing = "0.1"
tracing-subscriber = "0.3"
jsonwebtoken = "9"
bcrypt = "0.15"
`;
}
