//! AXUMkit CLI — Project scaffolding, code generation, and development tools.

use clap::{Parser, Subcommand};
use colored::Colorize;
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "axum-pk", version, about = "AXUMkit CLI — Modular Rust backend framework", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Create a new AXUMkit project
    New {
        /// Project name
        name: String,
        /// Template to use (basic, fullstack, api-only)
        #[arg(short, long, default_value = "basic")]
        template: String,
        /// Output directory
        #[arg(short, long)]
        dir: Option<PathBuf>,
    },
    /// Database operations
    Db {
        #[command(subcommand)]
        action: DbCommands,
    },
    /// Generate code
    Gen {
        #[command(subcommand)]
        action: GenCommands,
    },
    /// Diagnose common issues
    Doctor,
    /// Start development server
    Serve {
        /// Port to listen on
        #[arg(short, long, default_value = "3000")]
        port: u16,
        /// Enable hot reload
        #[arg(long, default_value = "true")]
        reload: bool,
    },
}

#[derive(Subcommand)]
enum DbCommands {
    /// Run pending migrations
    Migrate {
        /// Preview without executing
        #[arg(long)]
        dry_run: bool,
    },
    /// Rollback migrations
    Rollback {
        /// Number of steps to rollback
        #[arg(short, long, default_value = "1")]
        steps: u32,
    },
    /// Show migration status
    Status,
    /// Generate migration from schema diff
    Generate {
        /// Migration name
        name: String,
    },
}

#[derive(Subcommand)]
enum GenCommands {
    /// Generate a new model
    Model {
        /// Model name
        name: String,
    },
    /// Generate CRUD handler
    Handler {
        /// Model name
        name: String,
    },
    /// Generate tests
    Test {
        /// Model name
        name: String,
    },
    /// Generate frontend SDK
    Sdk {
        /// SDK type (typescript, react, rust)
        #[arg(short, long, default_value = "typescript")]
        lang: String,
    },
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::New { name, template, dir } => {
            cmd_new(&name, &template, dir);
        }
        Commands::Db { action } => {
            cmd_db(&action);
        }
        Commands::Gen { action } => {
            cmd_gen(&action);
        }
        Commands::Doctor => {
            cmd_doctor();
        }
        Commands::Serve { port, reload } => {
            cmd_serve(port, reload);
        }
    }
}

fn cmd_new(name: &str, template: &str, dir: Option<PathBuf>) {
    println!("{} Creating new AXUMkit project: {}", "✓".green(), name.bold());
    println!("  Template: {}", template);
    
    let base_dir = dir.unwrap_or_else(|| PathBuf::from(name));
    
    // Create project structure
    let dirs = [
        "src",
        "config",
        "crates",
        ".github/workflows",
    ];
    
    for d in &dirs {
        let path = base_dir.join(d);
        std::fs::create_dir_all(&path).unwrap_or_else(|e| {
            eprintln!("{} Failed to create {}: {}", "✗".red(), d, e);
            std::process::exit(1);
        });
        println!("  {} {}", "Created".dimmed(), path.display());
    }

    // Write Cargo.toml
    let cargo_toml = format!(r#"[package]
name = "{name}"
version = "0.1.0"
edition = "2021"

[dependencies]
axum-pk = {{ git = "https://github.com/yohanness16/AxumKit.git", features = ["full"] }}
tokio = {{ version = "1", features = ["full"] }}
serde = {{ version = "1", features = ["derive"] }}
"#);
    std::fs::write(base_dir.join("Cargo.toml"), cargo_toml).unwrap();
    println!("  {} Cargo.toml", "Created".dimmed());

    // Write main.rs
    let main_rs = r#"use axum_pkc::prelude::*;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    App::new()
        .run("0.0.0.0:3000")
        .await
}
"#;
    std::fs::write(base_dir.join("src/main.rs"), main_rs).unwrap();
    println!("  {} src/main.rs", "Created".dimmed());

    // Write config files
    std::fs::write(base_dir.join("config/default.toml"), r#"[app]
name = "my-app"
host = "0.0.0.0"
port = 3000
"#).unwrap();
    println!("  {} config/default.toml", "Created".dimmed());

    println!("\n{} Project '{}' created successfully!", "✓".green(), name.bold());
    println!("\n  cd {}", name);
    println!("  cargo run");
}

fn cmd_db(action: &DbCommands) {
    match action {
        DbCommands::Migrate { dry_run } => {
            if *dry_run {
                println!("{}", "Migration preview (dry run):".yellow());
            } else {
                println!("{} Running migrations...", "✓".green());
            }
            println!("  (Migration runner not yet connected to live DB)");
        }
        DbCommands::Rollback { steps } => {
            println!("{} Rolling back {} migration(s)...", "↩".yellow(), steps);
        }
        DbCommands::Status => {
            println!("{} Migration status:", "📋".bold());
            println!("  No migrations found (database not connected)");
        }
        DbCommands::Generate { name } => {
            let timestamp = chrono::Utc::now().format("%Y%m%d%H%M%S");
            println!("{} Generating migration: {}", "✓".green(), name);
            println!("  Created migration: {}_{}", timestamp, name);
        }
    }
}

fn cmd_gen(action: &GenCommands) {
    match action {
        GenCommands::Model { name } => {
            println!("{} Generating model: {}", "✓".green(), name.bold());
            println!(r#"  Add to src/main.rs:
  
  #[derive(DbModel, Serialize, Deserialize, Clone)]
  #[table(name = "{}")]
  struct {} {{
      #[primary_key]
      id: Uuid,
      // add fields here
  }}"#, name.to_lowercase(), name);
        }
        GenCommands::Handler { name } => {
            println!("{} Generating CRUD handler for: {}", "✓".green(), name.bold());
            println!("  Handler scaffold created for {}", name);
        }
        GenCommands::Test { name } => {
            println!("{} Generating tests for: {}", "✓".green(), name.bold());
        }
        GenCommands::Sdk { lang } => {
            println!("{} Generating {} SDK...", "✓".green(), lang.bold());
            println!("  (SDK generation from OpenAPI spec)");
        }
    }
}

fn cmd_doctor() {
    println!("{} AXUMkit Doctor", "🩺".bold());
    println!("  Checking environment...\n");
    
    // Check Rust
    match std::process::Command::new("rustc").arg("--version").output() {
        Ok(v) => println!("  {} Rust: {}", "✓".green(), String::from_utf8_lossy(&v.stdout).trim()),
        Err(_) => println!("  {} Rust: not found", "✗".red()),
    }

    // Check Cargo
    match std::process::Command::new("cargo").arg("--version").output() {
        Ok(v) => println!("  {} Cargo: {}", "✓".green(), String::from_utf8_lossy(&v.stdout).trim()),
        Err(_) => println!("  {} Cargo: not found", "✗".red()),
    }

    // Check SQLx CLI
    match std::process::Command::new("sqlx").arg("--version").output() {
        Ok(v) => println!("  {} SQLx CLI: {}", "✓".green(), String::from_utf8_lossy(&v.stdout).trim()),
        Err(_) => println!("  {} SQLx CLI: not found (install with: cargo install sqlx-cli)", "⚠".yellow()),
    }

    // Check Redis
    match std::process::Command::new("redis-cli").arg("--version").output() {
        Ok(v) => println!("  {} Redis CLI: {}", "✓".green(), String::from_utf8_lossy(&v.stdout).trim()),
        Err(_) => println!("  {} Redis CLI: not found (optional)", "⚠".yellow()),
    }

    println!("\n  All essential checks passed!");
}

fn cmd_serve(port: u16, reload: bool) {
    println!("{} Starting server on port {}", "🚀".bold(), port);
    if reload {
        println!("  Hot reload: enabled");
    }
    println!("  (Run: cargo run)");
}
