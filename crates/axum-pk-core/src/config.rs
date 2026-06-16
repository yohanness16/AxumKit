//! Configuration provider trait for AXUMkit plugins.

use crate::error::AppResult;
use std::collections::HashMap;
use std::env;

/// Trait for types that provide configuration.
pub trait ConfigProvider {
    /// Load configuration with the given prefix.
    fn load_prefix(prefix: &str) -> AppResult<HashMap<String, String>>
    where
        Self: Sized,
    {
        let mut map = HashMap::new();
        let prefix = format!("{}_", prefix.to_uppercase());

        for (key, value) in env::vars() {
            if key.starts_with(&prefix) {
                let config_key = key[prefix.len()..].to_lowercase();
                map.insert(config_key, value);
            }
        }

        Ok(map)
    }

    /// Load configuration from environment variables.
    fn load() -> AppResult<HashMap<String, String>>
    where
        Self: Sized,
    {
        Self::load_prefix("APP")
    }

    /// Get a required configuration value.
    fn require(map: &HashMap<String, String>, key: &str) -> AppResult<String> {
        map.get(key)
            .cloned()
            .ok_or_else(|| {
                crate::error::AppError::Config(format!(
                    "Missing required config: {}", key
                ))
            })
    }

    /// Get an optional configuration value with a default.
    fn get_or(map: &HashMap<String, String>, key: &str, default: &str) -> String {
        map.get(key).cloned().unwrap_or_else(|| default.to_string())
    }

    /// Get a parsed configuration value.
    fn parse_or<T: std::str::FromStr>(
        map: &HashMap<String, String>,
        key: &str,
        default: T,
    ) -> T {
        map.get(key)
            .and_then(|v| v.parse().ok())
            .unwrap_or(default)
    }
}

impl ConfigProvider for HashMap<String, String> {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_or() {
        let mut map = HashMap::new();
        map.insert("host".to_string(), "localhost".to_string());

        assert_eq!(HashMap::<String, String>::get_or(&map, "host", "0.0.0.0"), "localhost");
        assert_eq!(HashMap::<String, String>::get_or(&map, "missing", "default"), "default");
    }

    #[test]
    fn test_parse_or() {
        let mut map = HashMap::new();
        map.insert("port".to_string(), "8080".to_string());

        assert_eq!(HashMap::<String, String>::parse_or(&map, "port", 3000u16), 8080);
        assert_eq!(HashMap::<String, String>::parse_or(&map, "missing", 3000u16), 3000);
    }
}
