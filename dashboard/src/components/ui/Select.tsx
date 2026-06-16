"use client";

import React, { forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  className?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className = "", ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-[#374151] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-[#111827] focus:outline-none focus:ring-1 ${
              error
                ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]"
                : "border-[#E5E7EB] focus:border-[#6B7280] focus:ring-[#6B7280]"
            }`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[#DC2626]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-[#6B7280]">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
