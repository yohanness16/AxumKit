import PluginCard from "@/components/PluginCard";

interface PluginData {
  name: string;
  version: string;
  description: string;
  status: "active" | "inactive" | "error";
  dependencies: string[];
}

const PLUGINS: PluginData[] = [
  {
    name: "core",
    version: "0.1.0",
    description: "Core framework engine: routing, middleware, request lifecycle management.",
    status: "active",
    dependencies: [],
  },
  {
    name: "db",
    version: "0.1.0",
    description: "Database plugin with connection pooling, migrations, and query builder.",
    status: "active",
    dependencies: ["core", "config"],
  },
  {
    name: "auth",
    version: "0.1.0",
    description: "Authentication and authorization plugin supporting JWT and session-based auth.",
    status: "active",
    dependencies: ["core", "db"],
  },
  {
    name: "api",
    version: "0.1.0",
    description: "REST API scaffolding plugin with OpenAPI spec generation.",
    status: "active",
    dependencies: ["core", "auth"],
  },
  {
    name: "config",
    version: "0.1.0",
    description: "Configuration management plugin with environment-based settings.",
    status: "active",
    dependencies: ["core"],
  },
  {
    name: "redis",
    version: "0.1.0",
    description: "Redis caching and session storage plugin with cluster support.",
    status: "inactive",
    dependencies: ["core", "config"],
  },
  {
    name: "metrics",
    version: "0.1.0",
    description: "Prometheus metrics collection and Grafana dashboard integration.",
    status: "inactive",
    dependencies: ["core", "config"],
  },
  {
    name: "mailer",
    version: "0.1.0",
    description: "Email sending plugin with SMTP and transactional email service support.",
    status: "inactive",
    dependencies: ["core", "config"],
  },
];

function AddPluginIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

export default function PluginsPage() {
  const activeCount = PLUGINS.filter((p) => p.status === "active").length;
  const errorCount = PLUGINS.filter((p) => p.status === "error").length;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Plugin Manager</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Manage your AXUMkit plugins. Enable, disable, and configure plugin settings.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            <AddPluginIcon />
            Add Plugin
          </button>
          <div className="flex items-center gap-2 text-sm text-[#64748b]">
            <span>
              <span className="font-medium text-[#10b981]">{activeCount}</span> active
            </span>
            <span className="text-[#334155]">|</span>
            <span>
              <span className="font-medium text-[#64748b]">{PLUGINS.length - activeCount - errorCount}</span> inactive
            </span>
            {errorCount > 0 && (
              <>
                <span className="text-[#334155]">|</span>
                <span>
                  <span className="font-medium text-[#ef4444]">{errorCount}</span> error
                </span>
              </>
            )}
          </div>
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#64748b]" aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Search plugins..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder-[#475569] transition-colors focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] sm:w-64"
            aria-label="Search plugins"
          />
        </div>
      </div>

      {/* Plugin Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PLUGINS.map((plugin) => (
          <PluginCard
            key={plugin.name}
            name={plugin.name}
            version={plugin.version}
            description={plugin.description}
            status={plugin.status}
            dependencies={plugin.dependencies}
          />
        ))}
      </div>

      {/* Plugin Help */}
      <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">About Plugins</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
          Plugins extend the functionality of your AXUMkit application. Each plugin can declare
          dependencies on other plugins. Use the toggle switch to enable or disable a plugin at
          runtime. Disabling a plugin that other active plugins depend on will produce a warning.
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-[#64748b]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" aria-hidden="true" /> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#64748b]" aria-hidden="true" /> Inactive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" aria-hidden="true" /> Error
          </span>
        </div>
      </div>
    </div>
  );
}
