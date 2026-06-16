import React from "react";

export type StatusVariant = "active" | "inactive" | "error" | "warning" | "pending";

const STATUS_STYLES: Record<StatusVariant, string> = {
  active: "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]/50",
  inactive: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
  error: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]/50",
  warning: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]/50",
  pending: "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]",
};

const STATUS_LABELS: Record<StatusVariant, string> = {
  active: "Active",
  inactive: "Inactive",
  error: "Error",
  warning: "Warning",
  pending: "Pending",
};

const STATUS_DOTS: Record<StatusVariant, string> = {
  active: "bg-[#059669]",
  inactive: "bg-[#9CA3AF]",
  error: "bg-[#DC2626]",
  warning: "bg-[#D97706]",
  pending: "bg-[#6B7280]",
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
