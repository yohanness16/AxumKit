"use client";

import Link from "next/link";
import StatCard from "@/components/StatCard";
import PluginCard from "@/components/PluginCard";
import StatusBadge from "@/components/StatusBadge";
import { useDashboardStore } from "@/store/dashboard";

function ModelIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M19.125 14.625c.621 0 1.125.504 1.125 1.125" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 ${className ?? ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function Home() {
  const { models, endpoints, plugins, activityLog, dbConfig, togglePlugin } = useDashboardStore();

  const activePlugins = plugins.filter((p) => p.status === "active").length;
  const activeModels = models.length;
  const tablesCount = models.length;
  const routesCount = endpoints.filter((e) => e.status === "active").length;

  const SYSTEM_HEALTH = [
    { name: "API Server", status: "healthy" as const, detail: `Running — ${routesCount} endpoints active` },
    { name: "Database", status: dbConfig.connected ? "healthy" as const : "warning" as const, detail: dbConfig.connected ? "Connected — 12ms avg latency" : "Not connected" },
    { name: "Auth Service", status: "healthy" as const, detail: "JWT provider operational" },
  ];

  const TYPE_DOT_STYLES = {
    success: "bg-[#059669]",
    warning: "bg-[#D97706]",
    error: "bg-[#DC2626]",
    info: "bg-[#6B7280]",
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Welcome to AXUMkit. Manage your Rust backend framework visually.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 rounded-lg bg-[#374151] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.85a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            Generate Code
          </Link>
          <Link
            href="/models"
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Model
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Models" value={activeModels} icon={<ModelIcon />} color="primary" />
        <StatCard title="Tables" value={tablesCount} icon={<TableIcon />} color="accent" />
        <StatCard title="Routes" value={routesCount} icon={<RouteIcon />} color="primary" />
        <StatCard title="Status" value="✅" icon={<CheckIcon />} color="accent" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Plugin Overview */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#111827]">Plugins</h2>
            <span className="text-sm text-[#9CA3AF]}>{activePlugins} active</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {plugins.slice(0, 6).map((plugin) => (
              <PluginCard
                key={plugin.name}
                name={plugin.name}
                version={plugin.version}
                description={plugin.description}
                status={plugin.status}
                dependencies={plugin.dependencies}
                onToggle={() => togglePlugin(plugin.name)}
              />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <section aria-label="Recent activity">
            <h2 className="mb-4 text-lg font-semibold text-[#111827]">Recent Activity</h2>
            <div className="rounded-xl border border-[#E5E7EB] bg-white">
              <ul className="divide-y divide-[#E5E7EB]" role="list">
                {activityLog.slice(0, 6).map((item, index) => (
                  <li key={index} className="flex items-start gap-3 px-4 py-3">
                    <span
                      className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${TYPE_DOT_STYLES[item.type]}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#111827]">{item.action}</p>
                      <p className="text-xs text-[#9CA3AF]">{item.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* System Health */}
          <section aria-label="System health">
            <h2 className="mb-4 text-lg font-semibold text-[#111827]">System Health</h2>
            <div className="space-y-3">
              {SYSTEM_HEALTH.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        service.status === "healthy"
                          ? "bg-[#D1FAE5]"
                          : service.status === "warning"
                          ? "bg-[#FEF3C7]"
                          : "bg-[#FEE2E2]"
                      }`}
                      aria-hidden="true"
                    >
                      {service.status === "healthy" ? (
                        <CheckIcon className="text-[#059669]" />
                      ) : (
                        <svg
                          className={`h-4 w-4 ${service.status === "warning" ? "text-[#D97706]" : "text-[#DC2626]"}`}
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
                      <p className="text-sm font-medium text-[#111827]">{service.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{service.detail}</p>
                    </div>
                  </div>
                  <StatusBadge status={service.status === "healthy" ? "active" : "warning"} />
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section aria-label="Quick actions">
            <h2 className="mb-4 text-lg font-semibold text-[#111827]">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/models" className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors">
                <ModelIcon />
                <span className="font-medium">+ New Model</span>
              </Link>
              <Link href="/database" className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="font-medium">Connect Database</span>
              </Link>
              <Link href="/auth" className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span className="font-medium">Configure Auth</span>
              </Link>
              <Link href="/monitor" className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">View Monitoring</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
