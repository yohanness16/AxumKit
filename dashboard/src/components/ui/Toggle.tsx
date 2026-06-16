"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}: ToggleProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const track = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2 ${
        checked ? "bg-[#374151]" : "bg-[#D1D5DB]"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`.trim()}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );

  if (label) {
    return (
      <label
        className={`inline-flex items-center gap-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`.trim()}
      >
        {track}
        <span className="text-sm text-[#374151]">{label}</span>
      </label>
    );
  }

  return (
    <div className={className}>
      {track}
    </div>
  );
}
