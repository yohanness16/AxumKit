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
    iconBg: "bg-[#374151]/10",
    iconColor: "text-[#374151]",
  },
  accent: {
    iconBg: "bg-[#059669]/10",
    iconColor: "text-[#059669]",
  },
  danger: {
    iconBg: "bg-[#DC2626]/10",
    iconColor: "text-[#DC2626]",
  },
  warning: {
    iconBg: "bg-[#D97706]/10",
    iconColor: "text-[#D97706]",
  },
};

function TrendIcon({ direction }: { direction: "up" | "down" | "neutral" }) {
  if (direction === "up") {
    return (
      <svg className="h-4 w-4 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  if (direction === "down") {
    return (
      <svg className="h-4 w-4 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

export default function StatCard({ title, value, icon, trend, trendValue, color = "primary" }: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div
      className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition-colors hover:border-[#D1D5DB]"
      role="group"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#6B7280]">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-[#111827]">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1.5">
              <TrendIcon direction={trend} />
              <span
                className={`text-xs font-medium ${
                  trend === "up" ? "text-[#059669]" : trend === "down" ? "text-[#DC2626]" : "text-[#9CA3AF]"
                }`}
              >
                {trendValue}
              </span>
              <span className="text-xs text-[#9CA3AF]">vs last period</span>
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
