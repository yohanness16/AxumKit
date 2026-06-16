"use client";

import React, { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pills";
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
}) => {
  const isUnderline = variant === "underline";

  return (
    <div
      role="tablist"
      className={`
        flex gap-1
        ${isUnderline ? "border-b border-[#E5E7EB]" : ""}
      `}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              px-4 py-2.5 text-sm font-medium transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280]
              inline-flex items-center gap-2
              ${
                isUnderline
                  ? isActive
                    ? "border-b-2 border-[#374151] text-[#111827]"
                    : "text-[#6B7280] hover:text-[#374151]"
                  : isActive
                    ? "bg-[#F3F4F6] text-[#374151] rounded-lg"
                    : "text-[#6B7280] hover:text-[#374151]"
              }
            `}
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
