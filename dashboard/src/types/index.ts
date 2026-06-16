// ─── Core Domain Types ───

export type FieldType =
  | "string"
  | "integer"
  | "float"
  | "boolean"
  | "datetime"
  | "uuid"
  | "text"
  | "json"
  | "enum";

export type RelationshipType = "has_many" | "belongs_to" | "many_to_many";

export interface Field {
  id: string;
  name: string;
  type: FieldType;
  enumValues?: string[];
  primaryKey: boolean;
  unique: boolean;
  nullable: boolean;
  defaultValue?: string;
  indexed: boolean;
  hidden: boolean;
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  targetModel: string;
  foreignKey: string;
  throughTable?: string;
}

export interface Model {
  id: string;
  name: string;
  tableName: string;
  fields: Field[];
  relationships: Relationship[];
  timestamps: boolean;
  softDelete: boolean;
}

// ─── Database Types ───

export type DbEngine = "postgresql" | "mysql" | "sqlite";

export interface DbConfig {
  engine: DbEngine;
  connectionString: string;
  poolSize: number;
  timeout: number;
  autoMigrate: boolean;
  connected: boolean;
}

// ─── Auth Types ───

export type AuthMethod = "jwt" | "sessions" | "oauth2" | "api_keys";

export type JwtAlgorithm = "HS256" | "HS384" | "HS512" | "RS256";

export interface JwtConfig {
  algorithm: JwtAlgorithm;
  secret: string;
  accessTTL: number; // minutes
  refreshTTL: number; // days
  issuer: string;
}

export interface Role {
  name: string;
  permissions: string[];
  inherits?: string[];
}

export interface ProtectedRoute {
  method: string;
  path: string;
  requiredPermission: string;
}

export interface AuthConfig {
  method: AuthMethod;
  jwt: JwtConfig;
  roles: Role[];
  protectedRoutes: ProtectedRoute[];
}

// ─── API Types ───

export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  auth: "public" | "required" | "admin";
  status: "active" | "disabled";
  model?: string;
}

export interface ApiConfig {
  basePath: string;
  pagination: {
    defaultSize: number;
    maxSize: number;
  };
  cors: {
    enabled: boolean;
    origins: string[];
  };
}

// ─── Frontend Types ───

export type Framework = "nextjs" | "react" | "vue" | "svelte";
export type Language = "typescript" | "javascript";
export type StateLibrary = "tanstack" | "zustand" | "redux" | "none";
export type UiLibrary = "tailwind" | "shadcn" | "mui" | "none";

export interface FrontendConfig {
  framework: Framework;
  language: Language;
  stateLibrary: StateLibrary;
  uiLibrary: UiLibrary;
  outputPath: string;
}

// ─── Generation Types ───

export type GenerationStatus = "idle" | "generating" | "success" | "error";

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GenerationConfig {
  projectName: string;
  outputPath: string;
  generateModels: boolean;
  generateApi: boolean;
  generateAuth: boolean;
  generateDb: boolean;
  generateConfig: boolean;
  generateTests: boolean;
  generateFrontend: boolean;
  generateDocker: boolean;
  generateReadme: boolean;
}

// ─── Plugin Types ───

export type PluginStatus = "active" | "inactive" | "error";

export interface Plugin {
  name: string;
  version: string;
  description: string;
  status: PluginStatus;
  dependencies: string[];
}

// ─── Monitoring Types ───

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  method: string;
  path: string;
  status: number;
  duration: string;
  message?: string;
}

export interface MetricData {
  label: string;
  value: number;
  max: number;
  color: string;
}

export type HealthStatus = "healthy" | "warning" | "error";

export interface HealthService {
  name: string;
  status: HealthStatus;
  detail: string;
}

// ─── Activity Types ───

export type ActivityType = "success" | "warning" | "error" | "info";

export interface ActivityItem {
  action: string;
  timestamp: string;
  type: ActivityType;
}

// ─── Dashboard State (Zustand Store Shape) ───

export interface DashboardState {
  // Project
  projectName: string;

  // Models
  models: Model[];
  activeModel: string | null;

  // Database
  dbConfig: DbConfig;

  // Auth
  authConfig: AuthConfig;

  // API
  apiConfig: ApiConfig;
  endpoints: ApiEndpoint[];

  // Frontend
  frontendConfig: FrontendConfig;

  // Generation
  generationStatus: GenerationStatus;
  generatedFiles: GeneratedFile[];

  // Plugins
  plugins: Plugin[];

  // Monitoring
  activityLog: ActivityItem[];
  logs: LogEntry[];

  // ─── Actions ───

  // Project
  setProjectName: (name: string) => void;

  // Models
  addModel: (model: Model) => void;
  updateModel: (id: string, updates: Partial<Model>) => void;
  deleteModel: (id: string) => void;
  setActiveModel: (id: string | null) => void;
  addField: (modelId: string, field: Field) => void;
  updateField: (modelId: string, fieldId: string, updates: Partial<Field>) => void;
  deleteField: (modelId: string, fieldId: string) => void;
  addRelationship: (modelId: string, rel: Relationship) => void;
  deleteRelationship: (modelId: string, relId: string) => void;

  // Database
  setDbConfig: (updates: Partial<DbConfig>) => void;
  testDbConnection: () => Promise<void>;

  // Auth
  setAuthConfig: (updates: Partial<AuthConfig>) => void;
  setJwtConfig: (updates: Partial<JwtConfig>) => void;
  generateJwtSecret: () => void;
  addRole: (role: Role) => void;
  updateRole: (name: string, updates: Partial<Role>) => void;
  deleteRole: (name: string) => void;
  addProtectedRoute: (route: ProtectedRoute) => void;
  deleteProtectedRoute: (index: number) => void;

  // API
  setApiConfig: (updates: Partial<ApiConfig>) => void;
  addEndpoint: (endpoint: ApiEndpoint) => void;
  deleteEndpoint: (index: number) => void;
  toggleEndpointStatus: (index: number) => void;

  // Frontend
  setFrontendConfig: (updates: Partial<FrontendConfig>) => void;

  // Generation
  generateCode: () => Promise<void>;
  resetGeneration: () => void;

  // Plugins
  togglePlugin: (name: string) => void;

  // Monitoring
  addLog: (entry: LogEntry) => void;
  clearLogs: () => void;
  addActivity: (item: ActivityItem) => void;
}
