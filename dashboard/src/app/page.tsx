import StatCard from "@/components/StatCard";
import PluginCard from "@/components/PluginCard";

function PluginIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c-1.18-.143-2.13-.89-2.13-1.934V12M14.25 6.087c0-.355-.186-.676-.401-.959a1.417 1.417 0 00-.349-1.003c-1.007 0-1.875 1.007-1.875 2.25 0 .369.128.713.349 1.003.215.283.401.604.401.959v0c0 .346.298.628.657.643 1.408.055 2.775.157 4.163.3 1.18.143 2.13.89 2.13 1.934V12" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 ${className ?? ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

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
];

interface ActivityItem {
  action: string;
  timestamp: string;
  type: "success" | "warning" | "error" | "info";
}

const RECENT_ACTIVITY: ActivityItem[] = [
  { action: 'Plugin "auth" reloaded', timestamp: "2 min ago", type: "success" },
  { action: "Database migration 003_applied", timestamp: "15 min ago", type: "success" },
  { action: "High memory usage detected", timestamp: "1 hour ago", type: "warning" },
  { action: 'Plugin "config" updated', timestamp: "2 hours ago", type: "info" },
  { action: "Rate limit threshold reached on /api/login", timestamp: "3 hours ago", type: "warning" },
  { action: 'Plugin "redis" connection failed', timestamp: "5 hours ago", type: "error" },
];

interface HealthService {
  name: string;
  status: "healthy" | "warning" | "error";
  detail: string;
}

const SYSTEM_HEALTH: HealthService[] = [
  { name: "Database", status: "healthy", detail: "Connected - 12ms avg latency" },
  { name: "Redis", status: "error", detail: "Connection refused" },
  { name: "Auth Service", status: "healthy", detail: "All providers operational" },
];

const TYPE_STYLES = {
  success: "bg-[#10b981]",
  warning: "bg-[#f59e0b]",
  error: "bg-[#ef4444]",
  info: "bg-[#3b82f6]",
};

export default function Home() {
  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#64748b]">Welcome to AXUMkit. Here is an overview of your Rust backend framework.</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Plugins Active"
          value="5/6"
          icon={<PluginIcon />}
          trend="up"
          trendValue="+1"
          color="primary"
        />
        <StatCard
          title="Routes"
          value="24"
          icon={<RouteIcon />}
          trend="neutral"
          trendValue="0"
          color="accent"
        />
        <StatCard
          title="DB Status"
          value="Online"
          icon={<DatabaseIcon />}
          color="accent"
        />
        <StatCard
          title="Uptime"
          value="14d 6h"
          icon={<ClockIcon />}
          trend="up"
          color="warning"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Plugin Overview */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Plugins</h2>
            <span className="text-sm text-[#64748b]">{PLUGINS.filter((p) => p.status === "active").length} active</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <section aria-label="Recent activity">
            <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Recent Activity</h2>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <ul className="divide-y divide-[var(--border)]" role="list">
                {RECENT_ACTIVITY.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 px-4 py-3">
                    <span
                      className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${TYPE_STYLES[item.type]}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--foreground)]">{item.action}</p>
                      <p className="text-xs text-[#64748b]">{item.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* System Health */}
          <section aria-label="System health">
            <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">System Health</h2>
            <div className="space-y-3">
              {SYSTEM_HEALTH.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        service.status === "healthy"
                          ? "bg-[#10b981]/15"
                          : service.status === "warning"
                          ? "bg-[#f59e0b]/15"
                          : "bg-[#ef4444]/15"
                      }`}
                      aria-hidden="true"
                    >
                      {service.status === "healthy" ? (
                        <CheckIcon className="text-[#10b981]" />
                      ) : (
                        <svg
                          className={`h-4 w-4 ${service.status === "warning" ? "text-[#f59e0b]" : "text-[#ef4444]"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{service.name}</p>
                      <p className="text-xs text-[#64748b]">{service.detail}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      service.status === "healthy"
                        ? "text-[#10b981]"
                        : service.status === "warning"
                        ? "text-[#f59e0b]"
                        : "text-[#ef4444]"
                    }`}
                  >
                    {service.status === "healthy" ? "Healthy" : service.status === "warning" ? "Warning" : "Error"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
