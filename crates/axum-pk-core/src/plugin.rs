//! Plugin system — the heart of AXUMkit's extensibility.

use crate::error::AppResult;
use async_trait::async_trait;
use axum::Router;
use std::any::Any;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Context passed to plugins during initialization.
#[derive(Clone)]
pub struct PluginContext {
    /// Shared configuration values.
    pub config: HashMap<String, String>,
    /// Whether the application is running in development mode.
    pub is_dev: bool,
}

impl PluginContext {
    /// Create a new plugin context.
    pub fn new() -> Self {
        Self {
            config: HashMap::new(),
            is_dev: false,
        }
    }

    /// Set development mode.
    pub fn with_dev(mut self, is_dev: bool) -> Self {
        self.is_dev = is_dev;
        self
    }

    /// Insert a config value.
    pub fn with_config(mut self, key: impl Into<String>, value: impl Into<String>) -> Self {
        self.config.insert(key.into(), value.into());
        self
    }

    /// Get a config value.
    pub fn get_config(&self, key: &str) -> Option<&str> {
        self.config.get(key).map(|s| s.as_str())
    }
}

impl Default for PluginContext {
    fn default() -> Self {
        Self::new()
    }
}

/// Output of plugin initialization — what the plugin contributes to the app.
pub struct PluginOutput {
    /// Optional Axum router to merge into the main application.
    pub router: Option<Router>,
    /// Optional state to inject into the router.
    pub state: Option<Arc<dyn Any + Send + Sync>>,
    /// Plugin name for identification.
    pub name: String,
}

impl PluginOutput {
    /// Create an empty output (no routes).
    pub fn empty(name: impl Into<String>) -> Self {
        Self {
            router: None,
            state: None,
            name: name.into(),
        }
    }

    /// Create an output with a router.
    pub fn with_router(name: impl Into<String>, router: Router) -> Self {
        Self {
            router: Some(router),
            state: None,
            name: name.into(),
        }
    }

    /// Attach state to the output.
    pub fn with_state(
        mut self,
        state: Arc<dyn Any + Send + Sync>,
    ) -> Self {
        self.state = Some(state);
        self
    }
}

/// The core plugin trait. Every AXUMkit plugin must implement this.
#[async_trait]
pub trait Plugin: Send + Sync + 'static {
    /// Unique plugin identifier (e.g., "axum-pk-auth").
    fn name(&self) -> &'static str;

    /// Plugin semantic version.
    fn version(&self) -> &'static str {
        env!("CARGO_PKG_VERSION")
    }

    /// Plugin identifiers that must be initialized before this one.
    fn dependencies(&self) -> Vec<&'static str> {
        vec![]
    }

    /// Validate plugin configuration before startup.
    /// Called before `initialize` — return an error to prevent startup.
    async fn validate(&self, _ctx: &PluginContext) -> AppResult<()> {
        Ok(())
    }

    /// Initialize the plugin.
    /// Called after all dependencies have been validated.
    /// Returns routes, middleware, and state to merge into the application.
    async fn initialize(&self, ctx: &PluginContext) -> AppResult<PluginOutput>;

    /// Graceful shutdown hook.
    /// Called when the application is shutting down.
    async fn shutdown(&self) -> AppResult<()> {
        Ok(())
    }
}

/// Registry that holds all registered plugins and manages their lifecycle.
pub struct PluginRegistry {
    plugins: Vec<Box<dyn Plugin>>,
    initialized: RwLock<Vec<String>>,
}

impl PluginRegistry {
    /// Create a new empty registry.
    pub fn new() -> Self {
        Self {
            plugins: Vec::new(),
            initialized: RwLock::new(Vec::new()),
        }
    }

    /// Register a plugin.
    pub fn register<P: Plugin>(&mut self, plugin: P) {
        self.plugins.push(Box::new(plugin));
    }

    /// Get the number of registered plugins.
    pub fn len(&self) -> usize {
        self.plugins.len()
    }

    /// Check if no plugins are registered.
    pub fn is_empty(&self) -> bool {
        self.plugins.is_empty()
    }

    /// Get all registered plugins.
    pub fn plugins(&self) -> &[Box<dyn Plugin>] {
        &self.plugins
    }

    /// Initialize all plugins in dependency order.
    pub async fn initialize_all(
        &self,
        ctx: &PluginContext,
    ) -> AppResult<Vec<PluginOutput>> {
        let mut outputs = Vec::new();
        let mut initialized = self.initialized.write().await;

        for plugin in &self.plugins {
            // Skip already initialized plugins
            if initialized.contains(&plugin.name().to_string()) {
                tracing::warn!("Plugin '{}' already initialized, skipping", plugin.name());
                continue;
            }

            // Check dependencies
            for dep in plugin.dependencies() {
                if !initialized.contains(&dep.to_string()) {
                    return Err(crate::error::AppError::Config(format!(
                        "Plugin '{}' requires '{}' which is not registered or initialized",
                        plugin.name(),
                        dep
                    )));
                }
            }

            // Validate
            plugin.validate(ctx).await.map_err(|e| {
                crate::error::AppError::Config(format!(
                    "Plugin '{}' validation failed: {}",
                    plugin.name(),
                    e
                ))
            })?;

            // Initialize
            let output = plugin.initialize(ctx).await.map_err(|e| {
                crate::error::AppError::Config(format!(
                    "Plugin '{}' initialization failed: {}",
                    plugin.name(),
                    e
                ))
            })?;

            tracing::info!(
                "Plugin '{}' v{} initialized successfully",
                plugin.name(),
                plugin.version()
            );

            initialized.push(plugin.name().to_string());
            outputs.push(output);
        }

        Ok(outputs)
    }

    /// Shutdown all plugins in reverse order.
    pub async fn shutdown_all(&self) -> AppResult<()> {
        let initialized = self.initialized.read().await;

        for plugin_name in initialized.iter().rev() {
            // Find the plugin by name
            if let Some(plugin) = self
                .plugins
                .iter()
                .find(|p| p.name() == plugin_name)
            {
                plugin.shutdown().await.map_err(|e| {
                    crate::error::AppError::Internal {
                        source: anyhow::anyhow!(
                            "Plugin '{}' shutdown failed: {}",
                            plugin.name(),
                            e
                        ),
                    }
                })?;
                tracing::info!("Plugin '{}' shut down", plugin.name());
            }
        }

        Ok(())
    }
}

impl Default for PluginRegistry {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct TestPlugin {
        name: &'static str,
    }

    #[async_trait]
    impl Plugin for TestPlugin {
        fn name(&self) -> &'static str {
            self.name
        }

        async fn initialize(&self, _ctx: &PluginContext) -> AppResult<PluginOutput> {
            Ok(PluginOutput::empty(self.name))
        }
    }

    #[test]
    fn test_plugin_context() {
        let ctx = PluginContext::new()
            .with_dev(true)
            .with_config("key", "value");

        assert!(ctx.is_dev);
        assert_eq!(ctx.get_config("key"), Some("value"));
        assert_eq!(ctx.get_config("missing"), None);
    }

    #[test]
    fn test_plugin_output() {
        let output = PluginOutput::empty("test");
        assert_eq!(output.name, "test");
        assert!(output.router.is_none());
        assert!(output.state.is_none());
    }

    #[test]
    fn test_plugin_registry() {
        let mut registry = PluginRegistry::new();
        assert!(registry.is_empty());

        registry.register(TestPlugin { name: "test1" });
        registry.register(TestPlugin { name: "test2" });

        assert_eq!(registry.len(), 2);
    }

    #[tokio::test]
    async fn test_initialize_all() {
        let mut registry = PluginRegistry::new();
        registry.register(TestPlugin { name: "test1" });
        registry.register(TestPlugin { name: "test2" });

        let ctx = PluginContext::new();
        let outputs = registry.initialize_all(&ctx).await.unwrap();

        assert_eq!(outputs.len(), 2);
    }

    #[tokio::test]
    async fn test_dependency_check() {
        struct DependentPlugin;

        #[async_trait]
        impl Plugin for DependentPlugin {
            fn name(&self) -> &'static str {
                "dependent"
            }

            fn dependencies(&self) -> Vec<&'static str> {
                vec!["missing-dep"]
            }

            async fn initialize(
                &self,
                _ctx: &PluginContext,
            ) -> AppResult<PluginOutput> {
                Ok(PluginOutput::empty("dependent"))
            }
        }

        let mut registry = PluginRegistry::new();
        registry.register(DependentPlugin);

        let ctx = PluginContext::new();
        let result = registry.initialize_all(&ctx).await;
        assert!(result.is_err());
    }
}
