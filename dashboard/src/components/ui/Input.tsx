"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const inputClasses = `
      w-full rounded-lg border bg-white px-3 py-2 text-sm
      text-[#111827] placeholder-[#9CA3AF]
      focus:outline-none focus:ring-1
      ${error
        ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]"
        : "border-[#E5E7EB] focus:border-[#6B7280] focus:ring-[#6B7280]"
      }
      ${leftIcon ? "pl-10" : ""}
      ${rightIcon ? "pr-10" : ""}
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#374151] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#6B7280]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#6B7280]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#DC2626]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[#9CA3AF]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
