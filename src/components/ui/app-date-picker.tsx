"use client";

import * as Popover from "@radix-ui/react-popover";
import { th } from "date-fns/locale";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";

const YEAR_START = 1950;
const YEAR_END = new Date().getFullYear() + 5;
const thaiBuddhistYearFormatter = new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
  year: "numeric",
});
const monthLabelFormatter = new Intl.DateTimeFormat("th-TH", {
  month: "long",
});

type AppDatePickerProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  tone?: "admin" | "student";
  size?: "md" | "lg";
  disabled?: boolean;
  required?: boolean;
  startYear?: number;
  endYear?: number;
  wrapperClassName?: string;
  className?: string;
};

const displayDateFormatter = new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function parseDateValue(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function toDateValue(date: Date | undefined) {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const parsedDate = parseDateValue(value);

  if (!parsedDate) {
    return "";
  }

  return displayDateFormatter.format(parsedDate);
}

function formatThaiBuddhistYear(date: Date) {
  return thaiBuddhistYearFormatter.format(date);
}

function getToneClasses(tone: NonNullable<AppDatePickerProps["tone"]>) {
  if (tone === "student") {
    return {
      focus: "border-slate-200 focus:border-orange-300 focus:ring-orange-100",
      icon: "bg-orange-50 text-orange-500 ring-1 ring-orange-100",
      popover: "border-orange-100/80",
      nav: "text-orange-600 hover:bg-orange-50",
      caption: "text-orange-700",
      weekday: "text-orange-500/80",
      dropdown: "border-orange-200 bg-orange-50/70 text-orange-700 focus:border-orange-300 focus:ring-orange-100",
      selected: "bg-(--color-student) text-white hover:bg-(--color-student) focus:bg-(--color-student)",
      today: "border border-orange-200 text-(--color-student)",
      hover: "hover:bg-orange-50",
    };
  }

  return {
    focus: "border-slate-200 focus:border-admin/40 focus:ring-admin/10",
    icon: "bg-admin/8 text-(--color-admin) ring-1 ring-admin/10",
    popover: "border-admin/10",
    nav: "text-(--color-admin) hover:bg-admin/8",
    caption: "text-(--color-admin)",
    weekday: "text-slate-400",
    dropdown: "border-admin/15 bg-admin/6 text-(--color-admin) focus:border-admin/30 focus:ring-admin/10",
    selected: "bg-(--color-admin) text-white hover:bg-(--color-admin) focus:bg-(--color-admin)",
    today: "border border-admin/25 text-(--color-admin)",
    hover: "hover:bg-admin/8",
  };
}

export function AppDatePicker({
  id,
  name,
  value,
  defaultValue,
  onChange,
  placeholder = "Select date",
  error,
  tone = "admin",
  size = "lg",
  disabled = false,
  required = false,
  startYear = YEAR_START,
  endYear = YEAR_END,
  wrapperClassName,
  className,
}: AppDatePickerProps) {
  const isControlled = typeof value === "string";
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const currentValue = isControlled ? value ?? "" : internalValue;
  const selectedDate = parseDateValue(currentValue);
  const displayValue = currentValue ? formatDisplayDate(currentValue) : "";
  const toneClasses = getToneClasses(tone);
  const sizeClass = size === "md" ? "h-11 px-4 pr-14 text-sm" : "h-12 px-4 pr-14 text-sm";

  function handleValueChange(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }

  return (
    <div className={wrapperClassName}>
      {name ? <input type="hidden" name={name} value={currentValue} required={required} /> : null}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-invalid={error ? "true" : "false"}
            className={`relative w-full rounded-2xl border bg-slate-50 text-left text-slate-950 outline-none transition focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClass} ${error ? "border-red-200 focus:border-red-300 focus:ring-red-100" : toneClasses.focus} ${className ?? ""}`}
          >
            <span className={`block truncate ${displayValue ? "text-slate-950" : "text-slate-400"}`}>
              {displayValue || placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${error ? "bg-red-50 text-red-500 ring-1 ring-red-100" : toneClasses.icon}`}>
                <CalendarIcon className="h-4 w-4" aria-hidden="true" />
              </span>
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={8}
            align="start"
            className={`z-50 rounded-3xl border bg-white p-4 shadow-xl shadow-slate-900/10 outline-none ${toneClasses.popover}`}
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              startMonth={new Date(startYear, 0, 1)}
              endMonth={new Date(endYear, 11, 1)}
              locale={th}
              onSelect={(selected) => {
                handleValueChange(toDateValue(selected));
                setOpen(false);
              }}
              showOutsideDays
              formatters={{
                formatMonthDropdown: (date) => monthLabelFormatter.format(date),
                formatYearDropdown: (date) => formatThaiBuddhistYear(date),
                formatCaption: (date) => `${monthLabelFormatter.format(date)} ${formatThaiBuddhistYear(date)}`,
              }}
              classNames={{
                months: "flex flex-col",
                month: "space-y-4",
                caption: `relative flex items-center justify-center pt-1 ${toneClasses.caption}`,
                caption_label: "sr-only",
                dropdowns: "flex items-center justify-center gap-2 px-10",
                dropdown_root: "relative",
                dropdown: `h-9 rounded-xl border px-3 pr-8 text-sm font-medium outline-none transition focus:ring-4 ${toneClasses.dropdown}`,
                months_dropdown: "min-w-36",
                years_dropdown: "min-w-24",
                chevron: "h-4 w-4",
                nav: "flex items-center gap-1",
                button_previous: `absolute left-0 inline-flex h-8 w-8 items-center justify-center rounded-xl transition ${toneClasses.nav}`,
                button_next: `absolute right-0 inline-flex h-8 w-8 items-center justify-center rounded-xl transition ${toneClasses.nav}`,
                month_grid: "w-full border-collapse",
                weekdays: "grid grid-cols-7 gap-1",
                weekday: `flex h-9 items-center justify-center text-xs font-medium uppercase tracking-[0.12em] ${toneClasses.weekday}`,
                week: "mt-1 grid grid-cols-7 gap-1",
                day: "h-10 w-10",
                day_button: `h-10 w-10 rounded-2xl text-sm font-medium text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-slate-200 ${toneClasses.hover}`,
              }}
              modifiersClassNames={{
                selected: toneClasses.selected,
                today: toneClasses.today,
                outside: "text-slate-300",
                disabled: "text-slate-300 opacity-50",
                hidden: "invisible",
              }}
              components={{
                Chevron: ({ orientation, className: iconClassName }) => orientation === "left"
                  ? <ChevronLeftIcon className={iconClassName} />
                  : <ChevronRightIcon className={iconClassName} />,
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}