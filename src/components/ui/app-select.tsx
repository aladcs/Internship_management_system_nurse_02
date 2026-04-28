import { ChevronDown } from "lucide-react";
import type { ChangeEventHandler } from "react";

type AppSelectOption = {
  value: string;
  label: string;
  count?: number;
};

type AppSelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: ReadonlyArray<AppSelectOption>;
  placeholder?: string;
  error?: string;
  tone?: "admin" | "student" | "neutral";
  size?: "md" | "lg";
  surface?: "solid" | "muted";
  wrapperClassName?: string;
  className?: string;
  disabled?: boolean;
};

function getToneClass(tone: NonNullable<AppSelectProps["tone"]>) {
  if (tone === "student") {
    return "border-slate-200 hover:border-orange-200 focus:border-orange-300 focus:ring-orange-100";
  }

  if (tone === "neutral") {
    return "border-slate-200 hover:border-slate-300 focus:border-slate-300 focus:ring-slate-100";
  }

  return "border-slate-200 hover:border-admin/25 focus:border-admin/40 focus:ring-admin/10";
}

function getChevronToneClass(tone: NonNullable<AppSelectProps["tone"]>) {
  if (tone === "student") {
    return "bg-orange-50 text-orange-500 ring-1 ring-orange-100";
  }

  if (tone === "neutral") {
    return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
  }

  return "bg-admin/8 text-(--color-admin) ring-1 ring-admin/10";
}

export function AppSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
  tone = "admin",
  size = "md",
  surface = "solid",
  wrapperClassName,
  className,
  disabled = false,
}: AppSelectProps) {
  const sizeClass = size === "lg" ? "h-12 px-4 pr-14 text-sm" : "h-10 px-3 pr-13 text-sm";
  const surfaceClass = surface === "muted"
    ? "bg-slate-50/90 text-slate-950 shadow-inner shadow-white/70 focus:bg-white"
    : "bg-white text-slate-700 shadow-sm shadow-slate-900/5";
  const stateClass = error
    ? "border-red-200 focus:border-red-300 focus:ring-red-100"
    : getToneClass(tone);
  const chevronToneClass = error ? "bg-red-50 text-red-500 ring-1 ring-red-100" : getChevronToneClass(tone);

  return (
    <label className={`relative block ${wrapperClassName ?? ""}`}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? "true" : "false"}
        className={`w-full appearance-none rounded-2xl border outline-none transition duration-150 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass} ${surfaceClass} ${stateClass} ${className ?? ""}`}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {typeof option.count === "number" ? `${option.label} (${option.count})` : option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <span className={`flex items-center justify-center rounded-xl ${size === "lg" ? "h-8 w-8" : "h-7 w-7"} ${chevronToneClass}`}>
          <ChevronDown className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} aria-hidden="true" />
        </span>
      </span>
    </label>
  );
}