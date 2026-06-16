//! Common types shared across all AXUMkit plugins.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

/// A type-safe unique identifier.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Id(pub Uuid);

impl Id {
    /// Generate a new random ID.
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }

    /// Check if the ID is nil.
    pub fn is_nil(&self) -> bool {
        self.0.is_nil()
    }

    /// Create from an existing UUID.
    pub fn from_uuid(uuid: Uuid) -> Self {
        Self(uuid)
    }

    /// Get the inner UUID.
    pub fn uuid(&self) -> Uuid {
        self.0
    }
}

impl Default for Id {
    fn default() -> Self {
        Self::new()
    }
}

impl fmt::Display for Id {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<Uuid> for Id {
    fn from(uuid: Uuid) -> Self {
        Self(uuid)
    }
}

impl From<Id> for Uuid {
    fn from(id: Id) -> Self {
        id.0
    }
}

impl std::str::FromStr for Id {
    type Err = uuid::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self(Uuid::parse_str(s)?))
    }
}

/// Trait for entities that have an ID.
pub trait Entity {
    /// The entity's unique identifier.
    fn id(&self) -> &Id;

    /// The entity type name (for error messages).
    fn entity_type() -> &'static str
    where
        Self: Sized;
}

/// Trait for entities with created_at / updated_at timestamps.
pub trait Timestamps {
    fn created_at(&self) -> DateTime<Utc>;
    fn updated_at(&self) -> DateTime<Utc>;
    fn set_updated_at(&mut self, ts: DateTime<Utc>);
}

/// Trait for entities that support soft deletion.
pub trait SoftDeletable {
    fn deleted_at(&self) -> Option<DateTime<Utc>>;
    fn set_deleted_at(&mut self, ts: Option<DateTime<Utc>>);
    fn is_deleted(&self) -> bool {
        self.deleted_at().is_some()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_id_new() {
        let id = Id::new();
        assert!(!id.is_nil());
    }

    #[test]
    fn test_id_display() {
        let id = Id::new();
        let s = format!("{}", id);
        assert!(s.len() > 0);
    }

    #[test]
    fn test_id_from_uuid() {
        let uuid = Uuid::new_v4();
        let id = Id::from_uuid(uuid);
        assert_eq!(id.uuid(), uuid);
    }

    #[test]
    fn test_id_parse() {
        let id = Id::new();
        let s = format!("{}", id);
        let parsed: Id = s.parse().unwrap();
        assert_eq!(id, parsed);
    }
}
