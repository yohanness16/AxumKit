//! Unified error types for the AXUMkit ecosystem.

use axum::response::{IntoResponse, Response};
use axum::Json;
use axum::http::StatusCode;
use serde::Serialize;
use serde_json::json;
use std::fmt;

/// Result alias that uses [`AppError`] as the error type.
pub type AppResult<T> = Result<T, AppError>;

/// A field-level validation error.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct FieldError {
    /// The field name that failed validation.
    pub field: String,
    /// The validation error message.
    pub message: String,
    /// Optional error code for programmatic handling.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
}

impl FieldError {
    /// Create a new field error.
    pub fn new(field: impl Into<String>, message: impl Into<String>) -> Self {
        Self {
            field: field.into(),
            message: message.into(),
            code: None,
        }
    }

    /// Attach an error code.
    pub fn with_code(mut self, code: impl Into<String>) -> Self {
        self.code = Some(code.into());
        self
    }
}

impl fmt::Display for FieldError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.field, self.message)
    }
}

/// The unified error type for all AXUMkit plugins and applications.
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    /// Authentication is required but missing.
    #[error("Authentication required")]
    Unauthorized,

    /// The caller does not have sufficient permissions.
    #[error("Insufficient permissions")]
    Forbidden,

    /// Input validation failed.
    #[error("Validation failed: {message}")]
    Validation {
        message: String,
        errors: Vec<FieldError>,
    },

    /// A requested resource was not found.
    #[error("{resource} not found: {id}")]
    NotFound {
        resource: String,
        id: String,
    },

    /// A resource already exists.
    #[error("{resource} already exists: {field} = {value}")]
    Conflict {
        resource: String,
        field: String,
        value: String,
    },

    /// Too many requests (rate limiting).
    #[error("Too many requests. Retry after {retry_after}s")]
    TooManyRequests {
        retry_after: u64,
    },

    /// An internal server error occurred.
    #[error("Internal server error: {source}")]
    Internal {
        #[from]
        source: anyhow::Error,
    },

    /// A database error occurred.
    #[error("Database error: {message}")]
    Database {
        message: String,
    },

    /// A cache error occurred (non-fatal).
    #[error("Cache error: {message}")]
    Cache {
        message: String,
    },

    /// A configuration error occurred.
    #[error("Configuration error: {0}")]
    Config(String),

    /// A service is unavailable.
    #[error("Service unavailable: {0}")]
    Unavailable(String),

    /// Bad request.
    #[error("Bad request: {0}")]
    BadRequest(String),
}

impl AppError {
    /// Create a not-found error.
    pub fn not_found(resource: impl Into<String>, id: impl Into<String>) -> Self {
        Self::NotFound {
            resource: resource.into(),
            id: id.into(),
        }
    }

    /// Create a validation error from field errors.
    pub fn validation(errors: Vec<FieldError>) -> Self {
        let message = errors
            .iter()
            .map(|e| format!("{}: {}", e.field, e.message))
            .collect::<Vec<_>>()
            .join("; ");
        Self::Validation { message, errors }
    }

    /// Create a single-field validation error.
    pub fn validation_field(field: impl Into<String>, message: impl Into<String>) -> Self {
        Self::validation(vec![FieldError::new(field, message)])
    }

    /// Create a database error.
    pub fn database(message: impl Into<String>) -> Self {
        Self::Database {
            message: message.into(),
        }
    }

    /// Get the HTTP status code for this error.
    pub fn status_code(&self) -> StatusCode {
        match self {
            Self::Unauthorized => StatusCode::UNAUTHORIZED,
            Self::Forbidden => StatusCode::FORBIDDEN,
            Self::Validation { .. } => StatusCode::UNPROCESSABLE_ENTITY,
            Self::NotFound { .. } => StatusCode::NOT_FOUND,
            Self::Conflict { .. } => StatusCode::CONFLICT,
            Self::TooManyRequests { .. } => StatusCode::TOO_MANY_REQUESTS,
            Self::Internal { .. } => StatusCode::INTERNAL_SERVER_ERROR,
            Self::Database { .. } => StatusCode::INTERNAL_SERVER_ERROR,
            Self::Cache { .. } => StatusCode::INTERNAL_SERVER_ERROR,
            Self::Config(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::Unavailable(_) => StatusCode::SERVICE_UNAVAILABLE,
            Self::BadRequest(_) => StatusCode::BAD_REQUEST,
        }
    }

    /// Convert into a JSON error body.
    pub fn to_json(&self) -> serde_json::Value {
        let mut body = json!({
            "error": self.status_code().as_u16(),
            "message": self.to_string(),
        });

        if let Self::Validation { errors, .. } = self {
            body["fields"] = serde_json::to_value(errors).unwrap_or_default();
        }

        body
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = self.status_code();
        let body = Json(self.to_json());
        (status, body).into_response()
    }
}

/// Extension trait for converting Results into AppError responses.
pub trait IntoAppResponse<T> {
    /// Convert to an Axum response, mapping the error variant.
    fn app_context(self, context: &str) -> Result<T, AppError>;
}

impl<T, E: std::fmt::Display> IntoAppResponse<T> for Result<T, E> {
    fn app_context(self, context: &str) -> Result<T, AppError> {
        self.map_err(|e| AppError::Internal {
            source: anyhow::anyhow!("{}: {}", context, e),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_not_found() {
        let err = AppError::not_found("User", "123");
        assert_eq!(err.status_code(), StatusCode::NOT_FOUND);
        assert!(err.to_string().contains("User"));
        assert!(err.to_string().contains("123"));
    }

    #[test]
    fn test_validation() {
        let errors = vec![
            FieldError::new("email", "must be a valid email"),
            FieldError::new("name", "cannot be empty"),
        ];
        let err = AppError::validation(errors.clone());
        assert_eq!(err.status_code(), StatusCode::UNPROCESSABLE_ENTITY);
    }

    #[test]
    fn test_unauthorized() {
        let err = AppError::Unauthorized;
        assert_eq!(err.status_code(), StatusCode::UNAUTHORIZED);
    }

    #[test]
    fn test_forbidden() {
        let err = AppError::Forbidden;
        assert_eq!(err.status_code(), StatusCode::FORBIDDEN);
    }

    #[test]
    fn test_conflict() {
        let err = AppError::Conflict {
            resource: "User".into(),
            field: "email".into(),
            value: "test@example.com".into(),
        };
        assert_eq!(err.status_code(), StatusCode::CONFLICT);
    }

    #[test]
    fn test_too_many_requests() {
        let err = AppError::TooManyRequests { retry_after: 60 };
        assert_eq!(err.status_code(), StatusCode::TOO_MANY_REQUESTS);
    }

    #[test]
    fn test_field_error() {
        let fe = FieldError::new("email", "invalid").with_code("invalid_email");
        assert_eq!(fe.field, "email");
        assert_eq!(fe.code, Some("invalid_email".to_string()));
    }

    #[test]
    fn test_error_json() {
        let err = AppError::validation_field("email", "required");
        let json = err.to_json();
        assert_eq!(json["error"], 422);
        assert!(json["fields"].is_array());
    }

    #[test]
    fn test_database_error() {
        let err = AppError::database("connection refused");
        assert_eq!(err.status_code(), StatusCode::INTERNAL_SERVER_ERROR);
    }

    #[test]
    fn test_app_context_ok() {
        let result: Result<i32, anyhow::Error> = Ok(42);
        let mapped = result.app_context("test");
        assert_eq!(mapped.unwrap(), 42);
    }

    #[test]
    fn test_app_context_err() {
        let result: Result<i32, anyhow::Error> = Err(anyhow::anyhow!("oops"));
        let mapped = result.app_context("test");
        assert!(mapped.is_err());
        let err_str = mapped.unwrap_err().to_string();
        assert!(
            err_str.contains("test"),
            "Error should contain context 'test', got: {}",
            err_str
        );
    }
}
