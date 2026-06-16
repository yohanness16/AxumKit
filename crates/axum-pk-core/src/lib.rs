//! # AXUMkit Core
//!
//! Core traits, types, and error definitions for the AXUMkit plugin system.
//! Every plugin implements the [`Plugin`] trait and uses the shared types defined here.

pub mod config;
pub mod error;
pub mod plugin;
pub mod types;

pub use config::ConfigProvider;
pub use error::{AppError, AppResult, FieldError, IntoAppResponse};
pub use plugin::{Plugin, PluginContext, PluginOutput, PluginRegistry};
pub use types::{Entity, Id, SoftDeletable, Timestamps};

/// Prelude module — import everything needed to build a plugin or application.
pub mod prelude {
    pub use crate::config::ConfigProvider;
    pub use crate::error::{AppError, AppResult, FieldError};
    pub use crate::plugin::{Plugin, PluginContext, PluginOutput, PluginRegistry};
    pub use crate::types::{Entity, Id, SoftDeletable, Timestamps};
}
