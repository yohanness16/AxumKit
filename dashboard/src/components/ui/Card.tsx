import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

const paddingMap: Record<"none" | "sm" | "md" | "lg", string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function Card({
  children,
  className = "",
  padding = "md",
  hoverable = false,
}: CardProps) {
  const paddingClass = paddingMap[padding];
  const hoverableClass = hoverable
    ? "hover:border-[#D1D5DB] hover:shadow-sm transition-shadow"
    : "";

  return (
    <div
      className={`rounded-xl border border-[#E5E7EB] bg-white ${paddingClass} ${hoverableClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
