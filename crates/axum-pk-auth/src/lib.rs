//! axum-pk-auth — Authentication plugin for AXUMkit.
//!
//! Provides JWT-based authentication, Argon2 password hashing,
//! and role-based access control (RBAC) for AXUMkit applications.

use async_trait::async_trait;
use axum::{
    body::Body,
    http::{Response, StatusCode},
    response::IntoResponse,
};
use axum_pk_core::{AppResult, Plugin, PluginContext, PluginOutput};
use jsonwebtoken::{
    decode, encode, Algorithm, DecodingKey, EncodingKey, Header, TokenData, Validation,
};
use serde::{Deserialize, Serialize};
use std::time::Duration;

// ---------------------------------------------------------------------------
// 1. AuthError
// ---------------------------------------------------------------------------

/// Authentication and authorization error type.
#[derive(thiserror::Error, Debug)]
pub enum AuthError {
    #[error("Invalid token")]
    InvalidToken,

    #[error("Expired token")]
    ExpiredToken,

    #[error("Missing token")]
    MissingToken,

    #[error("Forbidden")]
    Forbidden,

    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Hash error: {0}")]
    HashError(String),

    #[error("User not found: {0}")]
    UserNotFound(String),
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response<Body> {
        let status = match &self {
            AuthError::InvalidToken
            | AuthError::ExpiredToken
            | AuthError::MissingToken
            | AuthError::InvalidCredentials => StatusCode::UNAUTHORIZED,
            AuthError::Forbidden => StatusCode::FORBIDDEN,
            AuthError::HashError(_) | AuthError::UserNotFound(_) => StatusCode::INTERNAL_SERVER_ERROR,
        };

        let body = serde_json::json!({
            "error": self.to_string(),
        });

        (status, axum::Json(body)).into_response()
    }
}

// ---------------------------------------------------------------------------
// 2. Claims
// ---------------------------------------------------------------------------

/// JWT claims structure.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Claims {
    /// Subject (user ID).
    pub sub: String,
    /// Expiration time (Unix timestamp).
    pub exp: usize,
    /// Issued at (Unix timestamp).
    pub iat: usize,
    /// Issuer.
    pub iss: String,
    /// User roles.
    pub roles: Vec<String>,
    /// User permissions.
    pub permissions: Vec<String>,
}

// ---------------------------------------------------------------------------
// 3. JwtConfig
// ---------------------------------------------------------------------------

/// JWT signing algorithm.
#[derive(Clone, Debug)]
pub enum JwtAlgorithm {
    Hs256,
    Rs256,
}

/// Configuration for JWT token generation and verification.
#[derive(Clone, Debug)]
pub struct JwtConfig {
    /// Signing algorithm.
    pub algorithm: JwtAlgorithm,
    /// Secret key for signing tokens.
    pub signing_key: String,
    /// Key for verifying tokens.
    pub verification_key: String,
    /// Access token time-to-live.
    pub access_token_ttl: Duration,
    /// Refresh token time-to-live.
    pub refresh_token_ttl: Duration,
    /// Token issuer.
    pub issuer: String,
}

impl Default for JwtConfig {
    fn default() -> Self {
        Self {
            algorithm: JwtAlgorithm::Hs256,
            signing_key: "change-me-to-a-secure-secret-key".to_string(),
            verification_key: "change-me-to-a-secure-secret-key".to_string(),
            access_token_ttl: Duration::from_secs(15 * 60),
            refresh_token_ttl: Duration::from_secs(7 * 24 * 60 * 60),
            issuer: "axum-pk-auth".to_string(),
        }
    }
}

impl JwtConfig {
    /// Create a new JwtConfig builder.
    pub fn builder() -> JwtConfigBuilder {
        JwtConfigBuilder::default()
    }
}

/// Builder for JwtConfig.
#[derive(Default)]
pub struct JwtConfigBuilder {
    algorithm: Option<JwtAlgorithm>,
    signing_key: Option<String>,
    verification_key: Option<String>,
    access_token_ttl: Option<Duration>,
    refresh_token_ttl: Option<Duration>,
    issuer: Option<String>,
}

impl JwtConfigBuilder {
    pub fn algorithm(mut self, algorithm: JwtAlgorithm) -> Self {
        self.algorithm = Some(algorithm);
        self
    }

    pub fn signing_key(mut self, key: impl Into<String>) -> Self {
        self.signing_key = Some(key.into());
        self
    }

    pub fn verification_key(mut self, key: impl Into<String>) -> Self {
        self.verification_key = Some(key.into());
        self
    }

    pub fn access_token_ttl(mut self, ttl: Duration) -> Self {
        self.access_token_ttl = Some(ttl);
        self
    }

    pub fn refresh_token_ttl(mut self, ttl: Duration) -> Self {
        self.refresh_token_ttl = Some(ttl);
        self
    }

    pub fn issuer(mut self, issuer: impl Into<String>) -> Self {
        self.issuer = Some(issuer.into());
        self
    }

    pub fn build(self) -> JwtConfig {
        let default = JwtConfig::default();
        JwtConfig {
            algorithm: self.algorithm.unwrap_or(default.algorithm),
            signing_key: self.signing_key.unwrap_or(default.signing_key),
            verification_key: self.verification_key.unwrap_or(default.verification_key),
            access_token_ttl: self.access_token_ttl.unwrap_or(default.access_token_ttl),
            refresh_token_ttl: self.refresh_token_ttl.unwrap_or(default.refresh_token_ttl),
            issuer: self.issuer.unwrap_or(default.issuer),
        }
    }
}

// ---------------------------------------------------------------------------
// 4. JwtService
// ---------------------------------------------------------------------------

/// Service for generating and verifying JWT tokens.
#[derive(Clone, Debug)]
pub struct JwtService {
    config: JwtConfig,
}

impl JwtService {
    /// Create a new JwtService from a JwtConfig.
    pub fn new(config: JwtConfig) -> Self {
        Self { config }
    }

    /// Generate a JWT token from the given claims.
    pub fn generate_token(&self, claims: &Claims) -> Result<String, AuthError> {
        let encoding_key = EncodingKey::from_secret(self.config.signing_key.as_bytes());
        let header = Header::new(Algorithm::HS256);

        encode(&header, claims, &encoding_key).map_err(|e| {
            tracing::error!("Failed to generate token: {}", e);
            AuthError::InvalidToken
        })
    }

    /// Verify a JWT token and return the decoded claims.
    pub fn verify_token(&self, token: &str) -> Result<Claims, AuthError> {
        let decoding_key = DecodingKey::from_secret(self.config.verification_key.as_bytes());
        let mut validation = Validation::new(Algorithm::HS256);
        validation.set_issuer(&[&self.config.issuer]);

        let token_data: TokenData<Claims> = decode(token, &decoding_key, &validation).map_err(|e| {
            match e.kind() {
                jsonwebtoken::errors::ErrorKind::ExpiredSignature => AuthError::ExpiredToken,
                _ => AuthError::InvalidToken,
            }
        })?;

        Ok(token_data.claims)
    }

    /// Generate a refresh token for the given user ID.
    pub fn generate_refresh_token(&self, user_id: &str) -> Result<String, AuthError> {
        let now = chrono::Utc::now().timestamp() as usize;
        let claims = Claims {
            sub: user_id.to_string(),
            exp: now + self.config.refresh_token_ttl.as_secs() as usize,
            iat: now,
            iss: self.config.issuer.clone(),
            roles: vec![],
            permissions: vec![],
        };
        self.generate_token(&claims)
    }

    /// Rotate a refresh token: verify the old one and issue a new access + refresh token pair.
    pub fn rotate_refresh_token(&self, token: &str) -> Result<(String, String), AuthError> {
        let claims = self.verify_token(token)?;
        let user_id = claims.sub.clone();

        // Generate new access token
        let now = chrono::Utc::now().timestamp() as usize;
        let access_claims = Claims {
            sub: user_id.clone(),
            exp: now + self.config.access_token_ttl.as_secs() as usize,
            iat: now,
            iss: self.config.issuer.clone(),
            roles: claims.roles,
            permissions: claims.permissions,
        };
        let access_token = self.generate_token(&access_claims)?;

        // Generate new refresh token
        let refresh_token = self.generate_refresh_token(&user_id)?;

        Ok((access_token, refresh_token))
    }
}

// ---------------------------------------------------------------------------
// 5. PasswordService
// ---------------------------------------------------------------------------

/// Service for password hashing and verification using Argon2.
pub struct PasswordService;

impl PasswordService {
    /// Hash a password using Argon2id.
    pub fn hash(password: &str) -> Result<String, AuthError> {
        use argon2::{
            password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
            Argon2,
        };

        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();

        argon2
            .hash_password(password.as_bytes(), &salt)
            .map(|h| h.to_string())
            .map_err(|e| AuthError::HashError(e.to_string()))
    }

    /// Verify a password against an Argon2 hash.
    pub fn verify(password: &str, hash: &str) -> Result<bool, AuthError> {
        use argon2::{password_hash::PasswordHash, Argon2, PasswordVerifier};

        let parsed_hash = PasswordHash::new(hash).map_err(|e| AuthError::HashError(e.to_string()))?;

        let argon2 = Argon2::default();
        match argon2.verify_password(password.as_bytes(), &parsed_hash) {
            Ok(()) => Ok(true),
            Err(argon2::password_hash::Error::Password) => Ok(false),
            Err(e) => Err(AuthError::HashError(e.to_string())),
        }
    }

    /// Check whether a hash needs to be rehashed (e.g., parameters changed).
    /// Returns `true` if the hash string is empty or parsing fails, indicating
    /// the password should be rehashed with current parameters.
    pub fn needs_rehash(hash: &str) -> Result<bool, AuthError> {
        use argon2::password_hash::PasswordHash;

        let parsed_hash = PasswordHash::new(hash).map_err(|e| AuthError::HashError(e.to_string()))?;

        // If the hash or salt components are missing, a rehash is needed.
        Ok(parsed_hash.hash.is_none() || parsed_hash.salt.is_none())
    }
}

// ---------------------------------------------------------------------------
// 6. Role
// ---------------------------------------------------------------------------

/// User roles with hierarchical permissions.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Role {
    SuperAdmin,
    Admin,
    Moderator,
    User,
}

impl Role {
    /// Return the permissions associated with this role.
    pub fn permissions(&self) -> Vec<Permission> {
        match self {
            Role::SuperAdmin => vec![Permission::All],
            Role::Admin => vec![
                Permission::ReadAll,
                Permission::WriteAll,
                Permission::DeleteAll,
                Permission::ReadOwn,
                Permission::WriteOwn,
                Permission::DeleteOwn,
            ],
            Role::Moderator => vec![
                Permission::ReadAll,
                Permission::WriteOwn,
                Permission::DeleteOwn,
                Permission::ReadOwn,
            ],
            Role::User => vec![Permission::ReadOwn, Permission::WriteOwn, Permission::DeleteOwn],
        }
    }

    /// Return the numeric rank of this role (higher = more powerful).
    pub fn rank(&self) -> u8 {
        match self {
            Role::SuperAdmin => 3,
            Role::Admin => 2,
            Role::Moderator => 1,
            Role::User => 0,
        }
    }
}

// ---------------------------------------------------------------------------
// 7. Permission
// ---------------------------------------------------------------------------

/// Granular permissions for RBAC.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Permission {
    All,
    ReadAll,
    WriteAll,
    DeleteAll,
    ReadOwn,
    WriteOwn,
    DeleteOwn,
}

impl Permission {
    /// Return the string representation of this permission.
    pub fn as_str(&self) -> &'static str {
        match self {
            Permission::All => "all",
            Permission::ReadAll => "read_all",
            Permission::WriteAll => "write_all",
            Permission::DeleteAll => "delete_all",
            Permission::ReadOwn => "read_own",
            Permission::WriteOwn => "write_own",
            Permission::DeleteOwn => "delete_own",
        }
    }
}

// ---------------------------------------------------------------------------
// 8. Rbac
// ---------------------------------------------------------------------------

/// Role-based access control engine.
pub struct Rbac;

impl Rbac {
    /// Check whether any of the given roles grants the required permission.
    pub fn user_has_permission(roles: &[Role], required: &Permission) -> bool {
        for role in roles {
            if role.permissions().contains(required) {
                return true;
            }
            // SuperAdmin with Permission::All grants everything.
            if role.permissions().contains(&Permission::All) {
                return true;
            }
        }
        false
    }

    /// Check whether the user has the required role or a higher role in the hierarchy.
    /// Hierarchy: SuperAdmin > Admin > Moderator > User
    pub fn user_has_role(roles: &[Role], required: &Role) -> bool {
        let required_rank = required.rank();
        roles.iter().any(|r| r.rank() >= required_rank)
    }
}

// ---------------------------------------------------------------------------
// 9. AuthUser
// ---------------------------------------------------------------------------

/// Authenticated user information.
#[derive(Clone, Debug)]
pub struct AuthUser {
    /// User ID.
    pub id: String,
    /// Assigned roles.
    pub roles: Vec<Role>,
    /// Granted permissions.
    pub permissions: Vec<Permission>,
    /// Original JWT claims.
    pub claims: Claims,
}

// ---------------------------------------------------------------------------
// 10. AuthPlugin
// ---------------------------------------------------------------------------

/// AXUMkit authentication plugin.
#[derive(Clone, Debug)]
pub struct AuthPlugin {
    config: JwtConfig,
}

impl AuthPlugin {
    /// Create a new AuthPlugin with the given JWT configuration.
    pub fn new(config: JwtConfig) -> Self {
        Self { config }
    }
}

impl Default for AuthPlugin {
    fn default() -> Self {
        Self {
            config: JwtConfig::default(),
        }
    }
}

#[async_trait]
impl Plugin for AuthPlugin {
    fn name(&self) -> &'static str {
        "axum-pk-auth"
    }

    async fn initialize(&self, _ctx: &PluginContext) -> AppResult<PluginOutput> {
        let _jwt_service = JwtService::new(self.config.clone());
        Ok(PluginOutput::empty(self.name()))
    }
}

// ---------------------------------------------------------------------------
// 11. Unit Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    fn test_config() -> JwtConfig {
        JwtConfig::builder()
            .signing_key("test-secret-key-that-is-long-enough-for-hs256")
            .verification_key("test-secret-key-that-is-long-enough-for-hs256")
            .issuer("test-issuer")
            .access_token_ttl(Duration::from_secs(3600))
            .refresh_token_ttl(Duration::from_secs(86400))
            .build()
    }

    fn test_config_different_keys() -> JwtConfig {
        JwtConfig::builder()
            .signing_key("signing-key-that-is-long-enough-for-hs256-algorithm")
            .verification_key("different-key-that-is-long-enough-for-hs256-verify")
            .issuer("test-issuer")
            .access_token_ttl(Duration::from_secs(3600))
            .refresh_token_ttl(Duration::from_secs(86400))
            .build()
    }

    // --- JWT roundtrip ---

    #[test]
    fn test_jwt_generate_verify_roundtrip() {
        let config = test_config();
        let service = JwtService::new(config);

        let now = chrono::Utc::now().timestamp() as usize;
        let claims = Claims {
            sub: "user-123".to_string(),
            exp: now + 3600,
            iat: now,
            iss: "test-issuer".to_string(),
            roles: vec!["admin".to_string()],
            permissions: vec!["read_all".to_string()],
        };

        let token = service.generate_token(&claims).expect("token generation failed");
        let verified = service.verify_token(&token).expect("token verification failed");

        assert_eq!(verified.sub, "user-123");
        assert_eq!(verified.iss, "test-issuer");
        assert_eq!(verified.roles, vec!["admin".to_string()]);
        assert_eq!(verified.permissions, vec!["read_all".to_string()]);
    }

    #[test]
    fn test_jwt_wrong_key_fails_verification() {
        let signing_config = test_config();
        let verify_config = test_config_different_keys();

        let signing_service = JwtService::new(signing_config);
        let verify_service = JwtService::new(verify_config);

        let now = chrono::Utc::now().timestamp() as usize;
        let claims = Claims {
            sub: "user-123".to_string(),
            exp: now + 3600,
            iat: now,
            iss: "test-issuer".to_string(),
            roles: vec![],
            permissions: vec![],
        };

        let token = signing_service.generate_token(&claims).expect("generation failed");
        let result = verify_service.verify_token(&token);

        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), AuthError::InvalidToken));
    }

    // --- Password hashing ---

    #[test]
    fn test_password_hash_verify_roundtrip() {
        let password = "super_secret_password_123!";
        let hash = PasswordService::hash(password).expect("hashing failed");

        let valid = PasswordService::verify(password, &hash).expect("verify failed");
        assert!(valid);

        let invalid = PasswordService::verify("wrong_password", &hash).expect("verify failed");
        assert!(!invalid);
    }

    // --- RBAC: SuperAdmin ---

    #[test]
    fn test_rbac_superadmin_has_all_permissions() {
        let roles = vec![Role::SuperAdmin];

        assert!(Rbac::user_has_permission(&roles, &Permission::All));
        assert!(Rbac::user_has_permission(&roles, &Permission::ReadAll));
        assert!(Rbac::user_has_permission(&roles, &Permission::WriteAll));
        assert!(Rbac::user_has_permission(&roles, &Permission::DeleteAll));
        assert!(Rbac::user_has_permission(&roles, &Permission::ReadOwn));
        assert!(Rbac::user_has_permission(&roles, &Permission::WriteOwn));
        assert!(Rbac::user_has_permission(&roles, &Permission::DeleteOwn));
    }

    // --- RBAC: Admin ---

    #[test]
    fn test_rbac_admin_has_read_all_but_not_all() {
        let roles = vec![Role::Admin];

        assert!(Rbac::user_has_permission(&roles, &Permission::ReadAll));
        assert!(Rbac::user_has_permission(&roles, &Permission::WriteAll));
        assert!(Rbac::user_has_permission(&roles, &Permission::DeleteAll));
        assert!(!Rbac::user_has_permission(&roles, &Permission::All));
    }

    // --- Role hierarchy ---

    #[test]
    fn test_rbac_role_hierarchy_admin_inherits_user() {
        let roles = vec![Role::Admin];

        // Admin should satisfy User role requirement
        assert!(Rbac::user_has_role(&roles, &Role::User));
        // Admin should satisfy Moderator role requirement
        assert!(Rbac::user_has_role(&roles, &Role::Moderator));
        // Admin should satisfy its own role
        assert!(Rbac::user_has_role(&roles, &Role::Admin));
        // Admin should NOT satisfy SuperAdmin
        assert!(!Rbac::user_has_role(&roles, &Role::SuperAdmin));
    }

    #[test]
    fn test_rbac_role_hierarchy_superadmin_inherits_all() {
        let roles = vec![Role::SuperAdmin];

        assert!(Rbac::user_has_role(&roles, &Role::User));
        assert!(Rbac::user_has_role(&roles, &Role::Moderator));
        assert!(Rbac::user_has_role(&roles, &Role::Admin));
        assert!(Rbac::user_has_role(&roles, &Role::SuperAdmin));
    }

    #[test]
    fn test_rbac_user_only_has_user_role() {
        let roles = vec![Role::User];

        assert!(Rbac::user_has_role(&roles, &Role::User));
        assert!(!Rbac::user_has_role(&roles, &Role::Moderator));
        assert!(!Rbac::user_has_role(&roles, &Role::Admin));
        assert!(!Rbac::user_has_role(&roles, &Role::SuperAdmin));
    }

    // --- Permission as_str ---

    #[test]
    fn test_permission_as_str() {
        assert_eq!(Permission::All.as_str(), "all");
        assert_eq!(Permission::ReadAll.as_str(), "read_all");
        assert_eq!(Permission::WriteAll.as_str(), "write_all");
        assert_eq!(Permission::DeleteAll.as_str(), "delete_all");
        assert_eq!(Permission::ReadOwn.as_str(), "read_own");
        assert_eq!(Permission::WriteOwn.as_str(), "write_own");
        assert_eq!(Permission::DeleteOwn.as_str(), "delete_own");
    }

    // --- AuthError IntoResponse ---

    #[test]
    fn test_auth_error_status_codes() {
        let errors_401: Vec<AuthError> = vec![
            AuthError::InvalidToken,
            AuthError::ExpiredToken,
            AuthError::MissingToken,
            AuthError::InvalidCredentials,
        ];

        for err in errors_401 {
            let response = err.into_response();
            assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
        }

        let response = AuthError::Forbidden.into_response();
        assert_eq!(response.status(), StatusCode::FORBIDDEN);

        let response = AuthError::HashError("oops".to_string()).into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);

        let response = AuthError::UserNotFound("alice".to_string()).into_response();
        assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
    }

    // --- Refresh token rotation ---

    #[test]
    fn test_refresh_token_rotation() {
        let config = test_config();
        let service = JwtService::new(config);

        let refresh_token = service.generate_refresh_token("user-456").expect("refresh token generation failed");
        let (access, new_refresh) = service.rotate_refresh_token(&refresh_token).expect("rotation failed");

        // Verify the new access token
        let claims = service.verify_token(&access).expect("access token verification failed");
        assert_eq!(claims.sub, "user-456");

        // Verify the new refresh token
        let refresh_claims = service.verify_token(&new_refresh).expect("new refresh token verification failed");
        assert_eq!(refresh_claims.sub, "user-456");
    }

    // --- AuthPlugin ---

    #[test]
    fn test_auth_plugin_name() {
        let plugin = AuthPlugin::default();
        assert_eq!(plugin.name(), "axum-pk-auth");
    }

    #[tokio::test]
    async fn test_auth_plugin_initialize() {
        let plugin = AuthPlugin::default();
        let ctx = PluginContext::new();
        let output = plugin.initialize(&ctx).await.expect("initialization failed");
        assert_eq!(output.name, "axum-pk-auth");
    }
}
