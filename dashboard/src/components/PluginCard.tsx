"use client";

import React, { useState } from "react";
import StatusBadge, { StatusVariant } from "./StatusBadge";

interface PluginCardProps {
  name: string;
  version: string;
  description: string;
  status: "active" | "inactive" | "error";
  dependencies: string[];
}

function ToggleSwitch({
  enabled,
  onToggle,
  ariaLabel,
}: {
  enabled: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] ${
        enabled ? "bg-[#10b981]" : "bg-[#475569]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-[#64748b] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function PluginCard({
  name,
  version,
  description,
  status,
  dependencies,
}: PluginCardProps) {
  const [enabled, setEnabled] = useState(status === "active");
  const [showDeps, setShowDeps] = useState(false);

  const handleToggle = () => {
    setEnabled((prev) => !prev);
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:bg-[var(--card-hover)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">{name}</h3>
            <span className="text-xs text-[#64748b]">v{version}</span>
          </div>
          <StatusBadge status={status as StatusVariant} className="mt-2" />
        </div>
        <ToggleSwitch
          enabled={enabled}
          onToggle={handleToggle}
          ariaLabel={`Toggle ${name} plugin`}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">{description}</p>

      {dependencies.length > 0 && (
        <div className="mt-3 border-t border-[var(--border)] pt-3">
          <button
            type="button"
            onClick={() => setShowDeps(!showDeps)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#94a3b8] transition-colors hover:text-[var(--foreground)]"
            aria-expanded={showDeps}
            aria-controls={`deps-${name}`}
          >
            <ChevronIcon open={showDeps} />
            {dependencies.length} {dependencies.length === 1 ? "dependency" : "dependencies"}
          </button>
          {showDeps && (
            <ul
              id={`deps-${name}`}
              className="mt-2 space-y-1 pl-5 text-xs text-[#64748b]"
              role="list"
            >
              {dependencies.map((dep) => (
                <li key={dep} className="list-disc">
                  {dep}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
