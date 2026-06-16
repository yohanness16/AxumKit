"use client";

import React, { useState } from "react";
import StatusBadge from "@/components/StatusBadge";

interface MetricData {
  label: string;
  value: number;
  max: number;
  color: string;
}

const REQUESTS_PER_MIN: MetricData[] = [
  { label: "00:00", value: 45, max: 100, color: "#3b82f6" },
  { label: "04:00", value: 20, max: 100, color: "#3b82f6" },
  { label: "08:00", value: 78, max: 100, color: "#3b82f6" },
  { label: "12:00", value: 95, max: 100, color: "#3b82f6" },
  { label: "16:00", value: 82, max: 100, color: "#3b82f6" },
  { label: "20:00", value: 60, max: 100, color: "#3b82f6" },
  { label: "Now", value: 72, max: 100, color: "#3b82f6" },
];

const RESPONSE_TIME: MetricData[] = [
  { label: "00:00", value: 120, max: 300, color: "#10b981" },
  { label: "04:00", value: 80, max: 300, color: "#10b981" },
  { label: "08:00", value: 250, max: 300, color: "#10b981" },
  { label: "12:00", value: 280, max: 300, color: "#f59e0b" },
  { label: "16:00", value: 200, max: 300, color: "#10b981" },
  { label: "20:00", value: 150, max: 300, color: "#10b981" },
  { label: "Now", value: 165, max: 300, color: "#10b981" },
];

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  method: string;
  path: string;
  status: number;
  duration: string;
}

const RECENT_LOGS: LogEntry[] = [
  { timestamp: "14:32:01", level: "info", method: "GET", path: "/api/health", status: 200, duration: "2ms" },
  { timestamp: "14:31:58", level: "info", method: "GET", path: "/api/users", status: 200, duration: "18ms" },
  { timestamp: "14:31:55", level: "warn", method: "POST", path: "/api/auth/login", status: 429, duration: "5ms" },
  { timestamp: "14:31:52", level: "error", method: "GET", path: "/api/users/123", status: 500, duration: "340ms" },
  { timestamp: "14:31:48", level: "info", method: "GET", path: "/api/posts", status: 200, duration: "22ms" },
  { timestamp: "14:31:45", level: "info", method: "POST", path: "/api/posts", status: 201, duration: "45ms" },
  { timestamp: "14:31:40", level: "warn", method: "GET", path: "/api/products", status: 304, duration: "8ms" },
  { timestamp: "14:31:38", level: "info", method: "DELETE", path: "/api/posts/456", status: 204, duration: "15ms" },
];

function MetricCard({
  title,
  value,
  subtitle,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  trend?: "up" | "down" | "stable";
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[#64748b]">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--foreground)]">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend === "up" ? "text-[#10b981]" : trend === "down" ? "text-[#ef4444]" : "text-[#64748b]"
            }`}
          >
            {trend === "up" ? "+" : trend === "down" ? "-" : "~"}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-[#64748b]">{subtitle}</p>
    </div>
  );
}

function BarChart({ data, title, unit }: { data: MetricData[]; title: string; unit: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        <span className="text-xs text-[#64748b]">Last 24 hours</span>
      </div>
      <div className="flex items-end gap-3" style={{ height: 140 }} role="img" aria-label={`${title} bar chart`}>
        {data.map((bar) => {
          const heightPct = Math.max((bar.value / bar.max) * 100, 4);
          return (
            <div key={bar.label} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs text-[#94a3b8]">{bar.value}{unit}</span>
              <div className="relative w-full overflow-hidden rounded-t bg-[var(--border)]" style={{ height: 100 }}>
                <div
                  className="absolute bottom-0 w-full rounded-t transition-all duration-500"
                  style={{ height: `${heightPct}%`, backgroundColor: bar.color, opacity: 0.8 }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-xs text-[#64748b]">{bar.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineChart({ data, title }: { data: MetricData[]; title: string }) {
  const width = 100;
  const height = 100;
  const maxVal = Math.max(...data.map((d) => d.max));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.value / maxVal) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        <span className="text-xs text-[#64748b]">ms</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full" role="img" aria-label={`${title} line chart`}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => (
          <line
            key={pct}
            x1={0}
            y1={(pct / 100) * height}
            x2={width}
            y2={(pct / 100) * height}
            stroke="#334155"
            strokeWidth={0.3}
            strokeDasharray="2,2"
          />
        ))}
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Area fill */}
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill="url(#gradient)"
          opacity={0.15}
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-2 flex justify-between text-xs text-[#64748b]">
        <span>00:00</span>
        <span>12:00</span>
        <span>Now</span>
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  const [logFilter, setLogFilter] = useState<"all" | "info" | "warn" | "error">("all");

  const filteredLogs =
    logFilter === "all" ? RECENT_LOGS : RECENT_LOGS.filter((l) => l.level === logFilter);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Monitoring</h1>
        <p className="mt-1 text-sm text-[#64748b]">
          Real-time server metrics, performance charts, and recent request logs.
        </p>
      </div>

      {/* Real-time Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Requests / min"
          value="72"
          subtitle="Avg over last 5 min"
          trend="stable"
        />
        <MetricCard
          title="Avg Response Time"
          value="165ms"
          subtitle="P95: 280ms"
          trend="down"
        />
        <MetricCard
          title="Error Rate"
          value="0.8%"
          subtitle="Target: < 1%"
          trend="down"
        />
        <MetricCard
          title="Active Connections"
          value="142"
          subtitle="Max: 500"
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <BarChart data={REQUESTS_PER_MIN} title="Requests per Minute" unit="" />
        <LineChart data={RESPONSE_TIME} title="Response Time" />
      </div>

      {/* System Health Indicators */}
      <section className="mb-8" aria-label="System health indicators">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">System Health</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* CPU */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#94a3b8]">CPU Usage</span>
              <StatusBadge status="active" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[var(--foreground)]">42</span>
                <span className="text-sm text-[#64748b]">%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-[#10b981]" style={{ width: "42%" }} aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Memory */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#94a3b8]">Memory</span>
              <StatusBadge status="warning" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[var(--foreground)]">78</span>
                <span className="text-sm text-[#64748b]">%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-[#f59e0b]" style={{ width: "78%" }} aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Disk */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#94a3b8]">Disk I/O</span>
              <StatusBadge status="active" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[var(--foreground)]">23</span>
                <span className="text-sm text-[#64748b]">%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-[#10b981]" style={{ width: "23%" }} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Logs */}
      <section aria-label="Recent logs">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Logs</h2>
          <div className="flex gap-2" role="group" aria-label="Filter logs by level">
            {(["all", "info", "warn", "error"] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLogFilter(level)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] ${
                  logFilter === level
                    ? "bg-[#3b82f6]/15 text-[#3b82f6]"
                    : "text-[#64748b] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
                }`}
                aria-pressed={logFilter === level}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[#64748b]">
                <th className="px-5 py-3 font-medium" scope="col">Time</th>
                <th className="px-5 py-3 font-medium" scope="col">Level</th>
                <th className="px-5 py-3 font-medium" scope="col">Method</th>
                <th className="px-5 py-3 font-medium" scope="col">Path</th>
                <th className="px-5 py-3 font-medium" scope="col">Status</th>
                <th className="px-5 py-3 font-medium" scope="col">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredLogs.map((log, index) => (
                <tr key={index} className="transition-colors hover:bg-[var(--card-hover)]">
                  <td className="px-5 py-2.5 font-mono text-xs text-[#64748b]">{log.timestamp}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium capitalize ${
                        log.level === "error"
                          ? "bg-[#ef4444]/15 text-[#ef4444]"
                          : log.level === "warn"
                          ? "bg-[#f59e0b]/15 text-[#f59e0b]"
                          : "bg-[#3b82f6]/15 text-[#3b82f6]"
                      }`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="rounded bg-[var(--border)] px-1.5 py-0.5 font-mono text-xs text-[var(--foreground)]">
                      {log.method}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-xs text-[#94a3b8]">{log.path}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={`font-mono text-xs font-medium ${
                        log.status >= 500
                          ? "text-[#ef4444]"
                          : log.status >= 400
                          ? "text-[#f59e0b]"
                          : log.status >= 300
                          ? "text-[#3b82f6]"
                          : "text-[#10b981]"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-xs text-[#64748b]">{log.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
