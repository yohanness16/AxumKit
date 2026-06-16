//! axum-pk-api — API utilities plugin for AXUMkit.
//!
//! Provides pagination, sorting, filtering, standardized API responses,
//! and Axum extractors for building consistent REST and JSON APIs.

use axum::{
    extract::{FromRequestParts, Query},
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;

/// Placeholder for axum-pk-api implementation.
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

// ---------------------------------------------------------------------------
// PaginationParams
// ---------------------------------------------------------------------------

/// Query parameters for pagination requests.
///
/// # Examples
///
/// ```ignore
/// // GET /items?page=2&per_page=50
/// let params: PaginationParams = serde_qs::from_str("page=2&per_page=50").unwrap();
/// assert_eq!(params.page(), 2);
/// assert_eq!(params.per_page(), 50);
/// ```
#[derive(Debug, Clone, Deserialize)]
pub struct PaginationParams {
    #[serde(default = "default_page")]
    page: Option<u64>,
    #[serde(default = "default_per_page", rename = "per_page")]
    per_page: Option<u64>,
    #[serde(default)]
    cursor: Option<String>,
}

fn default_page() -> Option<u64> {
    Some(1)
}

fn default_per_page() -> Option<u64> {
    Some(20)
}

impl PaginationParams {
    /// Returns the page number, guaranteed to be >= 1.
    pub fn page(&self) -> u64 {
        self.page.unwrap_or(1).max(1)
    }

    /// Returns the per_page value, clamped to 1..=100.
    pub fn per_page(&self) -> u64 {
        self.per_page.unwrap_or(20).clamp(1, 100)
    }

    /// Returns the cursor string for cursor-based pagination.
    pub fn cursor(&self) -> Option<&str> {
        self.cursor.as_deref()
    }

    /// Validates and returns a sanitized copy of the params.
    /// Clamps `per_page` to 100 and ensures `page >= 1`.
    pub fn validate(&self) -> Result<PaginationParams, ValidationError> {
        let page = self.page.unwrap_or(1).max(1);
        let per_page = self.per_page.unwrap_or(20).clamp(1, 100);

        if per_page > 100 {
            return Err(ValidationError::PerPageExceedsMax);
        }
        if page < 1 {
            return Err(ValidationError::PageBelowMin);
        }

        Ok(PaginationParams {
            page: Some(page),
            per_page: Some(per_page),
            cursor: self.cursor.clone(),
        })
    }
}

/// Errors that can occur when validating pagination parameters.
#[derive(Debug, Clone, thiserror::Error)]
pub enum ValidationError {
    #[error("per_page cannot exceed 100")]
    PerPageExceedsMax,
    #[error("page must be at least 1")]
    PageBelowMin,
}

impl IntoResponse for ValidationError {
    fn into_response(self) -> Response {
        let body = serde_json::json!({
            "success": false,
            "error": self.to_string(),
        });
        (StatusCode::UNPROCESSABLE_ENTITY, Json(body)).into_response()
    }
}

// ---------------------------------------------------------------------------
// PaginationMeta
// ---------------------------------------------------------------------------

/// Metadata about the current page within a full result set.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginationMeta {
    /// The current 1-indexed page number.
    pub current_page: u64,
    /// Number of items per page.
    pub per_page: u64,
    /// Total number of items across all pages.
    pub total_items: u64,
    /// Total number of pages.
    pub total_pages: u64,
}

impl PaginationMeta {
    /// Creates a new `PaginationMeta`, computing `total_pages` automatically.
    ///
    /// # Examples
    ///
    /// ```
    /// use axum_pk_api::PaginationMeta;
    /// let meta = PaginationMeta::new(1, 20, 100);
    /// assert_eq!(meta.total_pages, 5);
    /// assert_eq!(meta.total_items, 100);
    /// ```
    pub fn new(current_page: u64, per_page: u64, total_items: u64) -> Self {
        let total_pages = if total_items == 0 {
            0
        } else {
            ((total_items as f64) / (per_page as f64)).ceil() as u64
        };
        Self {
            current_page,
            per_page,
            total_items,
            total_pages,
        }
    }
}

// ---------------------------------------------------------------------------
// PaginationLinks
// ---------------------------------------------------------------------------

/// HATEOAS-style navigation links for paginated responses.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginationLinks {
    /// URL to the first page.
    pub first: String,
    /// URL to the last page.
    pub last: String,
    /// URL to the previous page, if one exists.
    pub prev: Option<String>,
    /// URL to the next page, if one exists.
    pub next: Option<String>,
    /// Opaque cursor for the next page cursor-based pagination.
    pub next_cursor: Option<String>,
}

// ---------------------------------------------------------------------------
// Paginated<T>
// ---------------------------------------------------------------------------

/// A standardized paginated response envelope.
///
/// # Examples
///
/// ```ignore
/// let response = Paginated {
///     data: vec![item1, item2],
///     meta: PaginationMeta::new(1, 20, 100),
///     links: PaginationLinks { ... },
/// };
/// ```
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Paginated<T> {
    /// The page of items.
    pub data: Vec<T>,
    /// Pagination metadata.
    pub meta: PaginationMeta,
    /// Navigation links.
    pub links: PaginationLinks,
}

// ---------------------------------------------------------------------------
// SortOrder
// ---------------------------------------------------------------------------

/// The direction in which to sort results.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum SortOrder {
    /// Ascending order.
    Asc,
    /// Descending order, optionally with the field name (without the `-` prefix).
    Desc(Option<String>),
}

impl Default for SortOrder {
    fn default() -> Self {
        SortOrder::Asc
    }
}

impl fmt::Display for SortOrder {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SortOrder::Asc => write!(f, "asc"),
            SortOrder::Desc(Some(field)) => write!(f, "-{}", field),
            SortOrder::Desc(None) => write!(f, "desc"),
        }
    }
}

impl FromStr for SortOrder {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "asc" => Ok(SortOrder::Asc),
            "desc" => Ok(SortOrder::Desc(None)),
            other => {
                if let Some(field) = other.strip_prefix('-') {
                    if field.is_empty() {
                        Err("empty field name in sort order".to_string())
                    } else {
                        Ok(SortOrder::Desc(Some(field.to_string())))
                    }
                } else {
                    // Unknown value defaults to Asc
                    Ok(SortOrder::Asc)
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// SortParams
// ---------------------------------------------------------------------------

/// Query parameters for sorting.
#[derive(Debug, Clone, Deserialize)]
pub struct SortParams {
    /// The field to sort by.
    #[serde(default, rename = "sort_by")]
    pub sort_by: Option<String>,
    /// The sort direction.
    #[serde(default)]
    pub sort_order: SortOrder,
}

// ---------------------------------------------------------------------------
// FilterOperator
// ---------------------------------------------------------------------------

/// Operators available for filtering query results.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum FilterOperator {
    /// Equal: field == value
    Eq,
    /// Not equal: field != value
    Ne,
    /// Greater than: field > value
    Gt,
    /// Less than: field < value
    Lt,
    /// Greater than or equal: field >= value
    Gte,
    /// Less than or equal: field <= value
    Lte,
    /// SQL LIKE pattern match
    Like,
    /// Value is in the provided list
    In,
    /// Value is not in the provided list
    NotIn,
    /// Field is NULL
    IsNull,
    /// Field is not NULL
    IsNotNull,
}

impl FilterOperator {
    /// Returns the operator as a lowercase string identifier.
    pub fn as_str(&self) -> &'static str {
        match self {
            FilterOperator::Eq => "eq",
            FilterOperator::Ne => "ne",
            FilterOperator::Gt => "gt",
            FilterOperator::Lt => "lt",
            FilterOperator::Gte => "gte",
            FilterOperator::Lte => "lte",
            FilterOperator::Like => "like",
            FilterOperator::In => "in",
            FilterOperator::NotIn => "not_in",
            FilterOperator::IsNull => "is_null",
            FilterOperator::IsNotNull => "is_not_null",
        }
    }
}

impl FromStr for FilterOperator {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "eq" => Ok(FilterOperator::Eq),
            "ne" => Ok(FilterOperator::Ne),
            "gt" => Ok(FilterOperator::Gt),
            "lt" => Ok(FilterOperator::Lt),
            "gte" => Ok(FilterOperator::Gte),
            "lte" => Ok(FilterOperator::Lte),
            "like" => Ok(FilterOperator::Like),
            "in" => Ok(FilterOperator::In),
            "not_in" => Ok(FilterOperator::NotIn),
            "is_null" => Ok(FilterOperator::IsNull),
            "is_not_null" => Ok(FilterOperator::IsNotNull),
            other => Err(format!("unknown filter operator: {}", other)),
        }
    }
}

// ---------------------------------------------------------------------------
// FilterParams
// ---------------------------------------------------------------------------

/// A single filter criterion.
#[derive(Debug, Clone, Deserialize)]
pub struct FilterParams {
    /// The field name to filter on.
    pub field: String,
    /// The comparison operator.
    pub operator: FilterOperator,
    /// The value to compare against.
    pub value: serde_json::Value,
}

// ---------------------------------------------------------------------------
// ApiSuccess<T>
// ---------------------------------------------------------------------------

/// Standardized success response wrapper.
///
/// Always serializes `success` as `true`.
#[derive(Debug, Clone, Serialize)]
pub struct ApiSuccess<T: Serialize> {
    /// Always `true` for success responses.
    pub success: bool,
    /// The response payload.
    pub data: T,
    /// An optional human-readable message.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

impl<T: Serialize> ApiSuccess<T> {
    /// Creates a new success response with the given data.
    pub fn new(data: T) -> Self {
        Self {
            success: true,
            data,
            message: None,
        }
    }

    /// Creates a new success response with data and a message.
    pub fn with_message(data: T, message: impl Into<String>) -> Self {
        Self {
            success: true,
            data,
            message: Some(message.into()),
        }
    }
}

// ---------------------------------------------------------------------------
// ApiErrorResponse
// ---------------------------------------------------------------------------

/// Standardized error response.
///
/// Always serializes `success` as `false`.
#[derive(Debug, Clone, Serialize)]
pub struct ApiErrorResponse {
    /// Always `false` for error responses.
    pub success: bool,
    /// A short error message.
    pub error: String,
    /// Optional structured error details.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
    /// An optional request ID for tracing.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_id: Option<String>,
}

impl ApiErrorResponse {
    /// Creates a new error response.
    pub fn new(error: impl Into<String>) -> Self {
        Self {
            success: false,
            error: error.into(),
            details: None,
            request_id: None,
        }
    }

    /// Adds structured details to the error response.
    pub fn with_details(mut self, details: serde_json::Value) -> Self {
        self.details = Some(details);
        self
    }

    /// Adds a request ID to the error response.
    pub fn with_request_id(mut self, request_id: impl Into<String>) -> Self {
        self.request_id = Some(request_id.into());
        self
    }
}

impl IntoResponse for ApiErrorResponse {
    fn into_response(self) -> Response {
        (StatusCode::BAD_REQUEST, Json(self)).into_response()
    }
}

// ---------------------------------------------------------------------------
// Paginate trait
// ---------------------------------------------------------------------------

/// Extension trait that adds pagination methods to any `Vec<T>`.
pub trait Paginate<T> {
    /// Paginates the vector according to the given parameters.
    ///
    /// Returns a tuple of (items for the current page, pagination metadata).
    ///
    /// # Examples
    ///
    /// ```ignore
    /// let items: Vec<u32> = (0..100).collect();
    /// let params = PaginationParams { page: Some(3), per_page: Some(20), cursor: None };
    /// let (page_items, meta) = items.paginate(&params);
    /// assert_eq!(page_items.len(), 20);
    /// assert_eq!(page_items[0], 40);
    /// assert_eq!(meta.total_pages, 5);
    /// ```
    fn paginate(self, params: &PaginationParams) -> (Vec<T>, PaginationMeta);
}

impl<T: Clone> Paginate<T> for Vec<T> {
    fn paginate(self, params: &PaginationParams) -> (Vec<T>, PaginationMeta) {
        let page = params.page();
        let per_page = params.per_page();
        let total_items = self.len() as u64;
        let meta = PaginationMeta::new(page, per_page, total_items);

        let start = ((page - 1) * per_page) as usize;
        if start >= self.len() {
            return (Vec::new(), meta);
        }

        let end = (start + per_page as usize).min(self.len());
        let items = self[start..end].to_vec();
        (items, meta)
    }
}

// ---------------------------------------------------------------------------
// QueryPaginate — Axum extractor
// ---------------------------------------------------------------------------

/// Axum extractor that wraps `PaginationParams` with automatic validation.
///
/// Returns HTTP 422 Unprocessable Entity if the pagination parameters
/// are invalid (e.g., `page < 1` or `per_page > 100`).
///
/// # Examples
///
/// ```ignore
/// async fn list_items(QueryPaginate(params): QueryPaginate) -> impl IntoResponse {
///     // params is guaranteed to be valid here
///     Json(serde_json::json!({ "page": params.page() }))
/// }
/// ```
pub struct QueryPaginate(pub PaginationParams);

impl<S> FromRequestParts<S> for QueryPaginate
where
    S: Send + Sync,
{
    type Rejection = Response;

    fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> impl std::future::Future<Output = Result<Self, Self::Rejection>> + Send {
        async {
            let Query(params) =
                Query::<PaginationParams>::from_request_parts(parts, state)
                    .await
                    .map_err(|e| {
                        let error =
                            ApiErrorResponse::new(format!("Invalid query parameters: {}", e));
                        (StatusCode::UNPROCESSABLE_ENTITY, Json(error)).into_response()
                    })?;

            match params.validate() {
                Ok(validated) => Ok(QueryPaginate(validated)),
                Err(e) => {
                    let error = ApiErrorResponse::new(e.to_string());
                    Err((StatusCode::UNPROCESSABLE_ENTITY, Json(error)).into_response())
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // --- PaginationMeta ---

    #[test]
    fn pagination_meta_calculation() {
        let meta = PaginationMeta::new(1, 20, 100);
        assert_eq!(meta.current_page, 1);
        assert_eq!(meta.per_page, 20);
        assert_eq!(meta.total_items, 100);
        assert_eq!(meta.total_pages, 5);
    }

    #[test]
    fn pagination_meta_zero_items() {
        let meta = PaginationMeta::new(1, 20, 0);
        assert_eq!(meta.total_pages, 0);
    }

    #[test]
    fn pagination_meta_partial_page() {
        let meta = PaginationMeta::new(1, 20, 95);
        assert_eq!(meta.total_pages, 5); // ceil(95/20) = 5
    }

    // --- Pagination slice ---

    #[test]
    fn pagination_slice_page_3() {
        let items: Vec<u32> = (0..100).collect();
        let params = PaginationParams {
            page: Some(3),
            per_page: Some(20),
            cursor: None,
        };
        let (page_items, meta) = items.paginate(&params);
        assert_eq!(page_items.len(), 20);
        assert_eq!(page_items[0], 40);
        assert_eq!(page_items[19], 59);
        assert_eq!(meta.current_page, 3);
        assert_eq!(meta.total_pages, 5);
    }

    #[test]
    fn pagination_slice_beyond_range() {
        let items: Vec<u32> = (0..10).collect();
        let params = PaginationParams {
            page: Some(5),
            per_page: Some(20),
            cursor: None,
        };
        let (page_items, meta) = items.paginate(&params);
        assert!(page_items.is_empty());
        assert_eq!(meta.total_pages, 1);
    }

    // --- SortOrder ---

    #[test]
    fn sort_order_from_str_asc() {
        let order: SortOrder = "asc".parse().unwrap();
        assert_eq!(order, SortOrder::Asc);
    }

    #[test]
    fn sort_order_from_str_desc() {
        let order: SortOrder = "desc".parse().unwrap();
        assert_eq!(order, SortOrder::Desc(None));
    }

    #[test]
    fn sort_order_from_str_desc_with_field() {
        let order: SortOrder = "-created_at".parse().unwrap();
        assert_eq!(order, SortOrder::Desc(Some("created_at".to_string())));
    }

    #[test]
    fn sort_order_default_is_asc() {
        let order: SortOrder = "unknown".parse().unwrap();
        assert_eq!(order, SortOrder::Asc);
    }

    #[test]
    fn sort_order_display() {
        assert_eq!(SortOrder::Asc.to_string(), "asc");
        assert_eq!(SortOrder::Desc(None).to_string(), "desc");
        assert_eq!(
            SortOrder::Desc(Some("name".to_string())).to_string(),
            "-name"
        );
    }

    // --- FilterOperator ---

    #[test]
    fn filter_operator_as_str_roundtrip() {
        let operators = vec![
            FilterOperator::Eq,
            FilterOperator::Ne,
            FilterOperator::Gt,
            FilterOperator::Lt,
            FilterOperator::Gte,
            FilterOperator::Lte,
            FilterOperator::Like,
            FilterOperator::In,
            FilterOperator::NotIn,
            FilterOperator::IsNull,
            FilterOperator::IsNotNull,
        ];

        for op in operators {
            let s = op.as_str();
            let parsed: FilterOperator = s.parse().unwrap();
            assert_eq!(op, parsed, "roundtrip failed for {}", s);
        }
    }

    #[test]
    fn filter_operator_as_str_values() {
        assert_eq!(FilterOperator::Eq.as_str(), "eq");
        assert_eq!(FilterOperator::NotIn.as_str(), "not_in");
        assert_eq!(FilterOperator::IsNull.as_str(), "is_null");
        assert_eq!(FilterOperator::IsNotNull.as_str(), "is_not_null");
    }

    // --- ApiSuccess ---

    #[test]
    fn api_success_serialization() {
        let success: ApiSuccess<Vec<u32>> = ApiSuccess::new(vec![1, 2, 3]);
        let json = serde_json::to_value(&success).unwrap();
        assert_eq!(json["success"], true);
        assert_eq!(json["data"], serde_json::json!([1, 2, 3]));
        assert!(json.get("message").is_none());
    }

    #[test]
    fn api_success_with_message() {
        let success = ApiSuccess::with_message(vec![1], "Items retrieved");
        let json = serde_json::to_value(&success).unwrap();
        assert_eq!(json["success"], true);
        assert_eq!(json["message"], "Items retrieved");
    }

    // --- ApiErrorResponse ---

    #[test]
    fn api_error_serialization() {
        let error = ApiErrorResponse::new("Something went wrong");
        let json = serde_json::to_value(&error).unwrap();
        assert_eq!(json["success"], false);
        assert_eq!(json["error"], "Something went wrong");
    }

    #[test]
    fn api_error_with_details() {
        let error = ApiErrorResponse::new("Validation failed")
            .with_details(serde_json::json!({"field": "email"}))
            .with_request_id("req-123");
        let json = serde_json::to_value(&error).unwrap();
        assert_eq!(json["success"], false);
        assert_eq!(json["request_id"], "req-123");
        assert_eq!(json["details"]["field"], "email");
    }

    // --- PaginationParams validation ---

    #[test]
    fn pagination_params_clamp_per_page() {
        let params = PaginationParams {
            page: Some(1),
            per_page: Some(200),
            cursor: None,
        };
        let validated = params.validate().unwrap();
        assert_eq!(validated.per_page(), 100);
    }

    #[test]
    fn pagination_params_defaults() {
        let params = PaginationParams {
            page: None,
            per_page: None,
            cursor: None,
        };
        assert_eq!(params.page(), 1);
        assert_eq!(params.per_page(), 20);
    }

    #[test]
    fn pagination_params_page_min() {
        let params = PaginationParams {
            page: Some(0),
            per_page: Some(10),
            cursor: None,
        };
        assert_eq!(params.page(), 1); // clamped to 1
    }

    #[test]
    fn pagination_params_per_page_min() {
        let params = PaginationParams {
            page: Some(1),
            per_page: Some(0),
            cursor: None,
        };
        assert_eq!(params.per_page(), 1); // clamped to 1
    }
}
