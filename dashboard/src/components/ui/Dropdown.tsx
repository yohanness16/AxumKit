"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setIsOpen((prev) => !prev)}>{trigger}</div>

      {isOpen && (
        <div
          className={`
            absolute z-20 mt-1 w-56 rounded-lg border border-[#E5E7EB] bg-white py-1.5 shadow-lg
            ${align === "right" ? "right-0" : "left-0"}
          `}
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider && (
                <div className="border-t border-[#E5E7EB] my-1" />
              )}
              <button
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={`
                  flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors
                  ${item.danger ? "text-[#DC2626]" : "text-[#374151]"}
                  ${
                    item.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#F3F4F6] cursor-pointer"
                  }
                `}
              >
                {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
