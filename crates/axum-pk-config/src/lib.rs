//! # AXUMkit Configuration Plugin
//!
//! Layered configuration management with environment variables, files, and validation.
//!
//! Configuration is loaded in priority order (highest first):
//! 1. Environment variables (prefixed)
//! 2. `.env` file
//! 3. `config/{environment}.toml`
//! 4. `config/default.toml`
//! 5. Default values

use axum_pk_core::error::{AppError, AppResult};
use serde::de::DeserializeOwned;
use std::collections::HashMap;
use std::env;
use std::fs;
use std::path::Path;

/// Configuration builder.
pub struct ConfigBuilder {
    prefix: String,
    env_file: Option<String>,
    config_dir: Option<String>,
    environment: String,
}

impl ConfigBuilder {
    /// Create a new config builder with the given env prefix.
    pub fn new(prefix: impl Into<String>) -> Self {
        let prefix = prefix.into();
        Self {
            environment: env::var(format!("{}_ENV", prefix.to_uppercase()))
                .unwrap_or_else(|_| "development".to_string()),
            prefix,
            env_file: None,
            config_dir: None,
        }
    }

    /// Set the .env file path.
    pub fn env_file(mut self, path: impl Into<String>) -> Self {
        self.env_file = Some(path.into());
        self
    }

    /// Set the config directory.
    pub fn config_dir(mut self, path: impl Into<String>) -> Self {
        self.config_dir = Some(path.into());
        self
    }

    /// Set the environment name.
    pub fn environment(mut self, env: impl Into<String>) -> Self {
        self.environment = env.into();
        self
    }

    /// Load and deserialize configuration.
    pub fn load<T: DeserializeOwned + Default>(&self) -> AppResult<T> {
        let mut map = HashMap::new();

        // Layer 4: config/default.toml
        if let Some(ref dir) = self.config_dir {
            let default_path = Path::new(dir).join("default.toml");
            if default_path.exists() {
                let content = fs::read_to_string(&default_path)
                    .map_err(|e| AppError::Config(format!("Failed to read default config: {}", e)))?;
                self.merge_toml(&mut map, &content)?;
            }
        }

        // Layer 3: config/{environment}.toml
        if let Some(ref dir) = self.config_dir {
            let env_path = Path::new(dir).join(format!("{}.toml", self.environment));
            if env_path.exists() {
                let content = fs::read_to_string(&env_path)
                    .map_err(|e| AppError::Config(format!("Failed to read env config: {}", e)))?;
                self.merge_toml(&mut map, &content)?;
            }
        }

        // Layer 2: .env file
        if let Some(ref env_file) = self.env_file {
            if Path::new(env_file).exists() {
                dotenvy::from_filename(env_file).ok();
            }
        } else if Path::new(".env").exists() {
            dotenvy::dotenv().ok();
        }

        // Layer 1: Environment variables (highest priority)
        let prefix = format!("{}_", self.prefix.to_uppercase());
        for (key, value) in env::vars() {
            if key.starts_with(&prefix) {
                let config_key = key[prefix.len()..].to_lowercase();
                map.insert(config_key, value);
            }
        }

        // Deserialize
        let json_value = serde_json::to_value(&map)
            .map_err(|e| AppError::Config(format!("Config serialization error: {}", e)))?;
        serde_json::from_value(json_value)
            .map_err(|e| AppError::Config(format!("Config deserialization error: {}", e)))
    }

    fn merge_toml(&self, map: &mut HashMap<String, String>, content: &str) -> AppResult<()> {
        let toml_value: toml::Value = content
            .parse()
            .map_err(|e| AppError::Config(format!("TOML parse error: {}", e)))?;
        self.flatten_toml("", &toml_value, map);
        Ok(())
    }

    fn flatten_toml(&self, prefix: &str, value: &toml::Value, map: &mut HashMap<String, String>) {
        match value {
            toml::Value::Table(table) => {
                for (key, val) in table {
                    let full_key = if prefix.is_empty() {
                        key.clone()
                    } else {
                        format!("{}_{}", prefix, key)
                    };
                    self.flatten_toml(&full_key, val, map);
                }
            }
            _ => {
                map.insert(prefix.to_lowercase(), value.to_string().trim_matches('"').to_string());
            }
        }
    }
}

/// Load configuration with default settings.
pub fn load<T: DeserializeOwned + Default>() -> AppResult<T> {
    ConfigBuilder::new("APP").load()
}

/// Load configuration with a custom prefix.
pub fn load_with_prefix<T: DeserializeOwned + Default>(prefix: &str) -> AppResult<T> {
    ConfigBuilder::new(prefix).load()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_config_builder_default() {
        let builder = ConfigBuilder::new("TEST");
        assert_eq!(builder.prefix, "TEST");
        assert_eq!(builder.environment, "development");
    }

    #[test]
    fn test_config_builder_custom() {
        let builder = ConfigBuilder::new("MYAPP")
            .env_file(".env.test")
            .config_dir("config")
            .environment("production");
        assert_eq!(builder.prefix, "MYAPP");
        assert_eq!(builder.env_file, Some(".env.test".to_string()));
        assert_eq!(builder.config_dir, Some("config".to_string()));
        assert_eq!(builder.environment, "production");
    }
}
