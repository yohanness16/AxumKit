import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "accent" | "danger" | "warning";
}

const COLOR_MAP = {
  primary: {
    iconBg: "bg-[#3b82f6]/15",
    iconColor: "text-[#3b82f6]",
  },
  accent: {
    iconBg: "bg-[#10b981]/15",
    iconColor: "text-[#10b981]",
  },
  danger: {
    iconBg: "bg-[#ef4444]/15",
    iconColor: "text-[#ef4444]",
  },
  warning: {
    iconBg: "bg-[#f59e0b]/15",
    iconColor: "text-[#f59e0b]",
  },
};

function TrendIcon({ direction }: { direction: "up" | "down" | "neutral" }) {
  if (direction === "up") {
    return (
      <svg className="h-4 w-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  if (direction === "down") {
    return (
      <svg className="h-4 w-4 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

export default function StatCard({ title, value, icon, trend, trendValue, color = "primary" }: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:bg-[var(--card-hover)]"
      role="group"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#94a3b8]">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1.5">
              <TrendIcon direction={trend} />
              <span
                className={`text-xs font-medium ${
                  trend === "up" ? "text-[#10b981]" : trend === "down" ? "text-[#ef4444]" : "text-[#64748b]"
                }`}
              >
                {trendValue}
              </span>
              <span className="text-xs text-[#64748b]">vs last period</span>
            </div>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colors.iconBg}`} aria-hidden="true">
          <div className={colors.iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
