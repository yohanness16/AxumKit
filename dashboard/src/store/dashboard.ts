import { create } from "zustand";
import type {
  DashboardState,
  Model,
  Field,
  Relationship,
  DbConfig,
  AuthConfig,
  JwtConfig,
  Role,
  ProtectedRoute,
  ApiConfig,
  ApiEndpoint,
  FrontendConfig,
  GenerationStatus,
  GeneratedFile,
  LogEntry,
  ActivityItem,
  Plugin,
} from "@/types";

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function generateJwtSecret(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ─── Seed Data ───

const SEED_MODELS: Model[] = [
  {
    id: "model-user",
    name: "User",
    tableName: "users",
    timestamps: true,
    softDelete: false,
    fields: [
      { id: "f1", name: "id", type: "uuid", primaryKey: true, unique: true, nullable: false, indexed: true, hidden: false },
      { id: "f2", name: "email", type: "string", primaryKey: false, unique: true, nullable: false, indexed: true, hidden: false },
      { id: "f3", name: "name", type: "string", primaryKey: false, unique: false, nullable: false, indexed: false, hidden: false },
      { id: "f4", name: "role", type: "enum", enumValues: ["user", "admin", "moderator"], primaryKey: false, unique: false, nullable: false, defaultValue: "user", indexed: false, hidden: false },
      { id: "f5", name: "password_hash", type: "string", primaryKey: false, unique: false, nullable: false, indexed: false, hidden: true },
      { id: "f6", name: "created_at", type: "datetime", primaryKey: false, unique: false, nullable: false, indexed: false, hidden: false },
    ],
    relationships: [
      { id: "r1", type: "has_many", targetModel: "Post", foreignKey: "author_id" },
    ],
  },
  {
    id: "model-post",
    name: "Post",
    tableName: "posts",
    timestamps: true,
    softDelete: true,
    fields: [
      { id: "f7", name: "id", type: "uuid", primaryKey: true, unique: true, nullable: false, indexed: true, hidden: false },
      { id: "f8", name: "title", type: "string", primaryKey: false, unique: false, nullable: false, indexed: false, hidden: false },
      { id: "f9", name: "content", type: "text", primaryKey: false, unique: false, nullable: true, indexed: false, hidden: false },
      { id: "f10", name: "author_id", type: "uuid", primaryKey: false, unique: false, nullable: false, indexed: true, hidden: false },
      { id: "f11", name: "published", type: "boolean", primaryKey: false, unique: false, nullable: false, defaultValue: "false", indexed: false, hidden: false },
    ],
    relationships: [
      { id: "r2", type: "belongs_to", targetModel: "User", foreignKey: "author_id" },
    ],
  },
  {
    id: "model-product",
    name: "Product",
    tableName: "products",
    timestamps: true,
    softDelete: false,
    fields: [
      { id: "f12", name: "id", type: "uuid", primaryKey: true, unique: true, nullable: false, indexed: true, hidden: false },
      { id: "f13", name: "name", type: "string", primaryKey: false, unique: false, nullable: false, indexed: true, hidden: false },
      { id: "f14", name: "price", type: "float", primaryKey: false, unique: false, nullable: false, indexed: false, hidden: false },
      { id: "f15", name: "category", type: "string", primaryKey: false, unique: false, nullable: true, indexed: false, hidden: false },
      { id: "f16", name: "metadata", type: "json", primaryKey: false, unique: false, nullable: true, indexed: false, hidden: false },
    ],
    relationships: [],
  },
];

const SEED_PLUGINS: Plugin[] = [
  { name: "core", version: "0.1.0", description: "Core framework engine: routing, middleware, request lifecycle management.", status: "active", dependencies: [] },
  { name: "db", version: "0.1.0", description: "Database plugin with connection pooling, migrations, and query builder.", status: "active", dependencies: ["core", "config"] },
  { name: "auth", version: "0.1.0", description: "Authentication and authorization plugin supporting JWT and session-based auth.", status: "active", dependencies: ["core", "db"] },
  { name: "api", version: "0.1.0", description: "REST API scaffolding plugin with OpenAPI spec generation.", status: "active", dependencies: ["core", "auth"] },
  { name: "config", version: "0.1.0", description: "Configuration management plugin with environment-based settings.", status: "active", dependencies: ["core"] },
  { name: "redis", version: "0.1.0", description: "Redis caching and session storage plugin with cluster support.", status: "inactive", dependencies: ["core", "config"] },
  { name: "metrics", version: "0.1.0", description: "Prometheus metrics collection and Grafana dashboard integration.", status: "inactive", dependencies: ["core", "config"] },
  { name: "mailer", version: "0.1.0", description: "Email sending plugin with SMTP and transactional email service support.", status: "inactive", dependencies: ["core", "config"] },
];

const SEED_ACTIVITY: ActivityItem[] = [
  { action: "User model created", timestamp: "2 min ago", type: "success" },
  { action: "Auth plugin configured", timestamp: "15 min ago", type: "success" },
  { action: "PostgreSQL connected", timestamp: "1 hour ago", type: "info" },
  { action: "Frontend SDK generated", timestamp: "2 hours ago", type: "info" },
  { action: "High memory usage detected", timestamp: "3 hours ago", type: "warning" },
  { action: "Redis connection failed", timestamp: "5 hours ago", type: "error" },
];

const SEED_LOGS: LogEntry[] = [
  { timestamp: "14:32:01", level: "info", method: "GET", path: "/api/health", status: 200, duration: "2ms" },
  { timestamp: "14:31:58", level: "info", method: "GET", path: "/api/users", status: 200, duration: "18ms" },
  { timestamp: "14:31:55", level: "warn", method: "POST", path: "/api/auth/login", status: 429, duration: "5ms" },
  { timestamp: "14:31:52", level: "error", method: "GET", path: "/api/users/123", status: 500, duration: "340ms" },
  { timestamp: "14:31:48", level: "info", method: "GET", path: "/api/posts", status: 200, duration: "22ms" },
  { timestamp: "14:31:45", level: "info", method: "POST", path: "/api/posts", status: 201, duration: "45ms" },
  { timestamp: "14:31:40", level: "warn", method: "GET", path: "/api/products", status: 304, duration: "8ms" },
  { timestamp: "14:31:38", level: "info", method: "DELETE", path: "/api/posts/456", status: 204, duration: "15ms" },
];

function generateEndpointsFromModels(models: Model[]): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];
  for (const model of models) {
    const path = `/api/v1/${model.tableName}`;
    endpoints.push({ method: "GET", path, auth: "public", status: "active", model: model.name });
    endpoints.push({ method: "POST", path, auth: "required", status: "active", model: model.name });
    endpoints.push({ method: "GET", path: `${path}/:id`, auth: "public", status: "active", model: model.name });
    endpoints.push({ method: "PUT", path: `${path}/:id`, auth: "required", status: "active", model: model.name });
    endpoints.push({ method: "DELETE", path: `${path}/:id`, auth: "admin", status: "active", model: model.name });
  }
  return endpoints;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // ─── Project ───
  projectName: "my-app",

  // ─── Models ───
  models: SEED_MODELS,
  activeModel: null,

  // ─── Database ───
  dbConfig: {
    engine: "postgresql",
    connectionString: "postgres://user:password@localhost:5432/mydb",
    poolSize: 16,
    timeout: 10,
    autoMigrate: true,
    connected: false,
  },

  // ─── Auth ───
  authConfig: {
    method: "jwt",
    jwt: {
      algorithm: "HS256",
      secret: generateJwtSecret(),
      accessTTL: 15,
      refreshTTL: 7,
      issuer: "my-app",
    },
    roles: [
      { name: "SuperAdmin", permissions: ["*"], inherits: [] },
      { name: "Admin", permissions: ["read.all", "write.all", "delete.own"], inherits: [] },
      { name: "Moderator", permissions: ["read.all", "write.own"], inherits: [] },
      { name: "User", permissions: ["read.own", "write.own"], inherits: [] },
    ],
    protectedRoutes: [
      { method: "GET", path: "/api/v1/users", requiredPermission: "users.read" },
      { method: "POST", path: "/api/v1/posts", requiredPermission: "posts.write" },
      { method: "DELETE", path: "/api/v1/products", requiredPermission: "products.delete" },
    ],
  },

  // ─── API ───
  apiConfig: {
    basePath: "/api/v1",
    pagination: { defaultSize: 20, maxSize: 100 },
    cors: { enabled: true, origins: ["http://localhost:3000"] },
  },
  endpoints: generateEndpointsFromModels(SEED_MODELS),

  // ─── Frontend ───
  frontendConfig: {
    framework: "nextjs",
    language: "typescript",
    stateLibrary: "tanstack",
    uiLibrary: "tailwind",
    outputPath: "./frontend",
  },

  // ─── Generation ───
  generationStatus: "idle",
  generatedFiles: [],

  // ─── Plugins ───
  plugins: SEED_PLUGINS,

  // ─── Monitoring ───
  activityLog: SEED_ACTIVITY,
  logs: SEED_LOGS,

  // ═══════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════

  // ─── Project ───
  setProjectName: (name) => set({ projectName: name }),

  // ─── Models ───
  addModel: (model) =>
    set((state) => ({
      models: [...state.models, model],
      endpoints: [
        ...state.endpoints,
        ...generateEndpointsFromModels([model]),
      ],
    })),

  updateModel: (id, updates) =>
    set((state) => ({
      models: state.models.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  deleteModel: (id) =>
    set((state) => {
      const model = state.models.find((m) => m.id === id);
      return {
        models: state.models.filter((m) => m.id !== id),
        endpoints: model
          ? state.endpoints.filter((e) => e.model !== model.name)
          : state.endpoints,
        activeModel: state.activeModel === id ? null : state.activeModel,
      };
    }),

  setActiveModel: (id) => set({ activeModel: id }),

  addField: (modelId, field) =>
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId ? { ...m, fields: [...m.fields, field] } : m
      ),
    })),

  updateField: (modelId, fieldId, updates) =>
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? { ...m, fields: m.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)) }
          : m
      ),
    })),

  deleteField: (modelId, fieldId) =>
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? { ...m, fields: m.fields.filter((f) => f.id !== fieldId) }
          : m
      ),
    })),

  addRelationship: (modelId, rel) =>
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId ? { ...m, relationships: [...m.relationships, rel] } : m
      ),
    })),

  deleteRelationship: (modelId, relId) =>
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? { ...m, relationships: m.relationships.filter((r) => r.id !== relId) }
          : m
      ),
    })),

  // ─── Database ───
  setDbConfig: (updates) =>
    set((state) => ({ dbConfig: { ...state.dbConfig, ...updates } })),

  testDbConnection: async () => {
    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    set((state) => ({ dbConfig: { ...state.dbConfig, connected: true } }));
    get().addActivity({ action: "Database connection established", timestamp: "Just now", type: "success" });
    get().addLog({
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      level: "info",
      method: "CONNECT",
      path: get().dbConfig.connectionString,
      status: 200,
      duration: "12ms",
      message: "Connection successful",
    });
  },

  // ─── Auth ───
  setAuthConfig: (updates) =>
    set((state) => ({ authConfig: { ...state.authConfig, ...updates } })),

  setJwtConfig: (updates) =>
    set((state) => ({
      authConfig: { ...state.authConfig, jwt: { ...state.authConfig.jwt, ...updates } },
    })),

  generateJwtSecret: () =>
    set((state) => ({
      authConfig: { ...state.authConfig, jwt: { ...state.authConfig.jwt, secret: generateJwtSecret() } },
    })),

  addRole: (role) =>
    set((state) => ({
      authConfig: { ...state.authConfig, roles: [...state.authConfig.roles, role] },
    })),

  updateRole: (name, updates) =>
    set((state) => ({
      authConfig: {
        ...state.authConfig,
        roles: state.authConfig.roles.map((r) => (r.name === name ? { ...r, ...updates } : r)),
      },
    })),

  deleteRole: (name) =>
    set((state) => ({
      authConfig: {
        ...state.authConfig,
        roles: state.authConfig.roles.filter((r) => r.name !== name),
      },
    })),

  addProtectedRoute: (route) =>
    set((state) => ({
      authConfig: { ...state.authConfig, protectedRoutes: [...state.authConfig.protectedRoutes, route] },
    })),

  deleteProtectedRoute: (index) =>
    set((state) => ({
      authConfig: {
        ...state.authConfig,
        protectedRoutes: state.authConfig.protectedRoutes.filter((_, i) => i !== index),
      },
    })),

  // ─── API ───
  setApiConfig: (updates) =>
    set((state) => ({ apiConfig: { ...state.apiConfig, ...updates } })),

  addEndpoint: (endpoint) => set((state) => ({ endpoints: [...state.endpoints, endpoint] })),

  deleteEndpoint: (index) =>
    set((state) => ({ endpoints: state.endpoints.filter((_, i) => i !== index) })),

  toggleEndpointStatus: (index) =>
    set((state) => ({
      endpoints: state.endpoints.map((e, i) =>
        i === index
          ? { ...e, status: e.status === "active" ? "disabled" : "active" }
          : e
      ),
    })),

  // ─── Frontend ───
  setFrontendConfig: (updates) =>
    set((state) => ({ frontendConfig: { ...state.frontendConfig, ...updates } })),

  // ─── Generation ───
  generateCode: async () => {
    set({ generationStatus: "generating" });
    // Simulate generation steps
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const state = get();
    const files: GeneratedFile[] = [];

    // Generate model files
    for (const model of state.models) {
      files.push({
        path: `src/models/${model.name.toLowerCase()}.ts`,
        content: `// ${model.name} model`,
      });
    }

    // Generate API files
    files.push({ path: "src/main.rs", content: "// Main entry point" });
    files.push({ path: "src/routes/mod.rs", content: "// Route definitions" });
    files.push({ path: "Cargo.toml", content: "[package]\nname = \"my-app\"" });

    // Generate migration files
    for (const model of state.models) {
      files.push({
        path: `migrations/001_create_${model.tableName}.sql`,
        content: `CREATE TABLE ${model.tableName} (...);`,
      });
    }

    // Generate frontend files
    if (state.frontendConfig.framework === "nextjs") {
      files.push({ path: "frontend/package.json", content: "// Package config" });
      files.push({ path: "frontend/src/app/page.tsx", content: "// Frontend entry" });
    }

    // Generate Docker files
    files.push({ path: "Dockerfile", content: "FROM rust:latest" });
    files.push({ path: "docker-compose.yml", content: "version: '3.8'" });

    // Generate README
    files.push({ path: "README.md", content: `# ${state.projectName}\n\nGenerated by AXUMkit.` });

    set({ generationStatus: "success", generatedFiles: files });
    get().addActivity({ action: `Generated ${files.length} files`, timestamp: "Just now", type: "success" });
  },

  resetGeneration: () => set({ generationStatus: "idle", generatedFiles: [] }),

  // ─── Plugins ───
  togglePlugin: (name) =>
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.name === name
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p
      ),
    })),

  // ─── Monitoring ───
  addLog: (entry) => set((state) => ({ logs: [entry, ...state.logs].slice(0, 100) })),
  clearLogs: () => set({ logs: [] }),
  addActivity: (item) => set((state) => ({ activityLog: [item, ...state.activityLog].slice(0, 50) })),
}));
