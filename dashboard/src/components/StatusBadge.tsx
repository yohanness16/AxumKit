import React from "react";

export type StatusVariant = "active" | "inactive" | "error" | "warning" | "pending";

const STATUS_STYLES: Record<StatusVariant, string> = {
  active: "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30",
  inactive: "bg-[#64748b]/15 text-[#64748b] border-[#64748b]/30",
  error: "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30",
  warning: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
  pending: "bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30",
};

const STATUS_LABELS: Record<StatusVariant, string> = {
  active: "Active",
  inactive: "Inactive",
  error: "Error",
  warning: "Warning",
  pending: "Pending",
};

const STATUS_DOTS: Record<StatusVariant, string> = {
  active: "bg-[#10b981]",
  inactive: "bg-[#64748b]",
  error: "bg-[#ef4444]",
  warning: "bg-[#f59e0b]",
  pending: "bg-[#3b82f6]",
};

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
}

export default function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]} ${className}`}
      role="status"
      aria-label={label ?? STATUS_LABELS[status]}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[status]}`} aria-hidden="true" />
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}
