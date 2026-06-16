"use client";

import React, { ReactNode, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xl animate-[scaleIn_150ms_ease-out] ${sizeClasses[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6B7280] hover:text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#6B7280] rounded"
          aria-label="Close modal"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Title */}
        {title && (
          <h2
            id="modal-title"
            className="text-lg font-semibold text-[#111827]"
          >
            {title}
          </h2>
        )}

        {/* Description */}
        {description && (
          <p
            id="modal-description"
            className="text-sm text-[#6B7280] mt-1"
          >
            {description}
          </p>
        )}

        {/* Content */}
        <div className={title || description ? "mt-4" : ""}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
