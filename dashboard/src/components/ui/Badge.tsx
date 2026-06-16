import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  size?: BadgeSize;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]",
  success: "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]",
  warning: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
  danger: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
  info: "bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]",
  neutral: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
};

export function Badge({
  variant = "default",
  children,
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
