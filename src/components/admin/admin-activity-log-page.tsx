"use client";

import Link from "next/link";
import { useDeferredValue, useState, type ReactNode } from "react";
import { logoutAction } from "../../app/intern/dashboard/actions";
import { AdminLayoutShell, type AdminShellNavItem } from "./admin-layout-shell";
import { AppDatePicker } from "@/components/ui/app-date-picker";
import { AppSelect } from "@/components/ui/app-select";
import {
  filterAdminActivityLogs,
  getActorRoleLabel,
  type ActivityCategoryFilter,
  type ActivityRoleFilter,
  type AdminActivityLogItem,
} from "../../lib/admin/activity-log-shared";
import { appShellClass } from "../../lib/page-shell";

const DISPLAY_TIME_ZONE = "Asia/Bangkok";

const dateHeaderFormatter = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: DISPLAY_TIME_ZONE,
});

const timeOnlyFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: DISPLAY_TIME_ZONE,
});

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: DISPLAY_TIME_ZONE,
});

const CURRENT_YEAR = new Date().getUTCFullYear();

const selectedDateFormatter = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: DISPLAY_TIME_ZONE,
});

type AdminActivityLogPageProps = {
  currentUser: {
    email: string;
    name: string | null;
  };
  activityLogs: AdminActivityLogItem[];
  summary: {
    totalLogs: number;
    lastUpdatedLabel: string | null;
    lastUpdatedByLabel: string | null;
    lastUpdatedByEmail: string | null;
  };
};

type SummaryChipProps = {
  icon: ReactNode;
  label: string;
  value: string;
  subvalue?: string | null;
};

type FilterSelectProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: Array<{
    value: T;
    label: string;
    count: number;
  }>;
};

type GroupedActivityLogs = {
  label: string;
  items: AdminActivityLogItem[];
};

type DatePreset = {
  value: string;
  label: string;
};

const ADMIN_NAV_ITEMS: AdminShellNavItem[] = [
  { href: "/intern/dashboard", label: "แดชบอร์ด" },
  { href: "/intern/admin/students", label: "รายชื่อนักศึกษา", match: "prefix" },
  { href: "/intern/notifications", label: "การแจ้งเตือน" },
  { href: "/intern/activity-logs", label: "บันทึกกิจกรรม" },
];

function ActivityIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-4 w-4">
      <path d="M3.5 10h2.25l1.5-3.5 3 7 2.25-5h4" />
      <path d="M3.25 4.75h13.5" opacity="0.3" />
      <path d="M3.25 15.25h13.5" opacity="0.3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-5 w-5">
      <path d="M10 2.75 4.5 4.7v4.55c0 3.5 2.16 6.36 5.5 7.98 3.34-1.62 5.5-4.48 5.5-7.98V4.7L10 2.75Z" />
      <path d="m7.75 9.9 1.45 1.45 3.05-3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <circle cx="8.5" cy="8.5" r="5.75" />
      <path d="m13 13 4.25 4.25" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <rect x="3.5" y="4.5" width="13" height="11" rx="2.5" />
      <path d="M6.5 2.75v3.5" strokeLinecap="round" />
      <path d="M13.5 2.75v3.5" strokeLinecap="round" />
      <path d="M3.5 8h13" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-4 w-4">
      <circle cx="10" cy="10" r="6.75" />
      <path d="M10 6.5v3.5l2.2 1.45" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-4 w-4">
      <circle cx="10" cy="6.25" r="3" />
      <path d="M4 16c1.28-2.9 3.37-4.35 6-4.35 2.63 0 4.72 1.45 6 4.35" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-14 w-14">
      <rect x="10" y="14" width="44" height="36" rx="10" className="fill-admin/10 stroke-admin/25" strokeWidth="2" />
      <path d="M20 26h24" className="stroke-admin/45" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 36h18" className="stroke-admin/35" strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="41" r="8" className="fill-(--color-admin) text-white" />
      <path d="M42.5 41h7" className="stroke-current" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M46 37.5v7" className="stroke-current" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-3.5 w-3.5">
      <circle cx="10" cy="10" r="6.5" />
      <path d="m7.2 10.1 1.8 1.8 3.8-4.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="m13.8 3.7 2.5 2.5" strokeLinecap="round" />
      <path d="m5.2 15.6 1.6-4.3 6.6-6.6a1.5 1.5 0 0 1 2.1 0l.8.8a1.5 1.5 0 0 1 0 2.1l-6.6 6.6-4.5 1.4Z" strokeLinejoin="round" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-3.5 w-3.5">
      <path d="M6 3.5h5l3 3V15a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 5 15V5A1.5 1.5 0 0 1 6.5 3.5Z" strokeLinejoin="round" />
      <path d="M11 3.5V7h3.5" strokeLinejoin="round" />
      <path d="M7.5 10h5" strokeLinecap="round" />
      <path d="M7.5 12.75h5" strokeLinecap="round" />
    </svg>
  );
}

function getRolePillClass(role: AdminActivityLogItem["actorRole"]) {
  if (role === "student") {
    return "bg-orange-100 text-orange-700";
  }

  if (role === "super_admin") {
    return "bg-violet-100 text-violet-700";
  }

  if (role === "admin") {
    return "bg-admin/10 text-(--color-admin)";
  }

  return "bg-slate-100 text-slate-600";
}

function getActionBadge(entry: AdminActivityLogItem) {
  if (entry.action === "admin_approved_form" || entry.actionLabel === "อนุมัติแบบฟอร์ม") {
    return {
      className: "bg-green-100 text-green-700",
      icon: <CheckCircleIcon />,
    };
  }

  if (
    entry.action === "student_edited_form" ||
    entry.action === "admin_edited_student_data" ||
    entry.actionLabel === "แก้ไขข้อมูล"
  ) {
    return {
      className: "bg-blue-100 text-blue-700",
      icon: <PencilIcon />,
    };
  }

  if (
    entry.action === "student_submitted_form" ||
    entry.action === "student_resubmitted_form" ||
    entry.actionLabel === "ส่งแบบฟอร์ม"
  ) {
    return {
      className: "bg-purple-100 text-purple-700",
      icon: <FileTextIcon />,
    };
  }

  return {
    className: "bg-gray-100 text-gray-600",
    icon: <ActivityIcon />,
  };
}

function getActorIcon(role: AdminActivityLogItem["actorRole"]) {
  if (role === "admin" || role === "super_admin") {
    return <ShieldIcon />;
  }

  return <UserIcon />;
}

function getDateKey(value: string) {
  return dateKeyFormatter.format(new Date(value));
}

function getDateGroupLabel(value: string) {
  const date = new Date(value);
  return dateHeaderFormatter.format(date);
}

function formatSelectedDateLabel(value: string) {
  if (!value) {
    return "";
  }

  return selectedDateFormatter.format(new Date(`${value}T00:00:00+07:00`));
}

function getDateOffsetValue(offsetDays: number, now = new Date()) {
  const date = new Date(now);
  date.setDate(now.getDate() + offsetDays);

  return getDateKey(date.toISOString());
}

function groupActivityLogsByDate(activityLogs: AdminActivityLogItem[]) {
  const groups: GroupedActivityLogs[] = [];

  for (const entry of activityLogs) {
    const label = getDateGroupLabel(entry.createdAtIso);
    const lastGroup = groups.at(-1);

    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(entry);
      continue;
    }

    groups.push({
      label,
      items: [entry],
    });
  }

  return groups;
}

function SummaryChip({ icon, label, value, subvalue }: SummaryChipProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-900/5">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-1.5 text-base font-semibold tracking-tight text-slate-950">{value}</p>
      {subvalue ? <p className="mt-0.5 truncate text-xs text-slate-400">{subvalue}</p> : null}
    </article>
  );
}

function FilterSelect<T extends string>({ value, onChange, options }: FilterSelectProps<T>) {
  return (
    <AppSelect
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      options={options}
      tone="admin"
      size="md"
      surface="muted"
      wrapperClassName="min-w-42"
      className="font-medium"
    />
  );
}

export function AdminActivityLogPage({ currentUser, activityLogs, summary }: AdminActivityLogPageProps) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<ActivityRoleFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategoryFilter>("all");
  const [selectedDate, setSelectedDate] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const roleCounts = {
    all: activityLogs.length,
    admin: activityLogs.filter((entry) => entry.actorRole === "admin" || entry.actorRole === "super_admin").length,
    student: activityLogs.filter((entry) => entry.actorRole === "student").length,
  };

  const categoryCounts = {
    all: activityLogs.length,
    submission: activityLogs.filter((entry) => entry.actionCategory === "submission").length,
    edit: activityLogs.filter((entry) => entry.actionCategory === "edit").length,
    file: activityLogs.filter((entry) => entry.actionCategory === "file").length,
    status: activityLogs.filter((entry) => entry.actionCategory === "status").length,
    other: activityLogs.filter((entry) => entry.actionCategory === "other").length,
  };

  const roleOptions: FilterSelectProps<ActivityRoleFilter>["options"] = [
    { value: "all", label: "ทุกคน", count: roleCounts.all },
    { value: "admin", label: "ผู้ดูแล", count: roleCounts.admin },
    { value: "student", label: "นักศึกษา", count: roleCounts.student },
  ];

  const categoryOptions: FilterSelectProps<ActivityCategoryFilter>["options"] = [
    { value: "all", label: "ทุกประเภท", count: categoryCounts.all },
    { value: "submission", label: "ส่งฟอร์ม", count: categoryCounts.submission },
    { value: "edit", label: "แก้ไข", count: categoryCounts.edit },
    { value: "file", label: "ไฟล์", count: categoryCounts.file },
    { value: "status", label: "สถานะ", count: categoryCounts.status },
    { value: "other", label: "อื่น ๆ", count: categoryCounts.other },
  ];

  const filteredLogs = filterAdminActivityLogs(activityLogs, {
    query: normalizedQuery,
    role: roleFilter,
    category: categoryFilter,
  }).filter((entry) => (selectedDate ? getDateKey(entry.createdAtIso) === selectedDate : true));
  const groupedLogs = groupActivityLogsByDate(filteredLogs);
  const datePresets: DatePreset[] = [
    { value: getDateOffsetValue(0), label: "วันนี้" },
    { value: getDateOffsetValue(-1), label: "เมื่อวาน" },
    { value: getDateOffsetValue(-7), label: "7 วันที่แล้ว" },
  ];
  const selectedDateLabel = formatSelectedDateLabel(selectedDate);

  const hasActiveFilters =
    query.length > 0 || roleFilter !== "all" || categoryFilter !== "all" || selectedDate.length > 0;

  return (
    <AdminLayoutShell
      currentPath="/intern/activity-logs"
      currentUser={currentUser}
      homeHref="/intern/dashboard"
      logoutAction={logoutAction}
      navItems={ADMIN_NAV_ITEMS}
      roleLabel="ผู้ดูแลระบบ"
    >
      <main className={`${appShellClass} py-8 lg:py-10`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
            พื้นที่ผู้ดูแลระบบ
          </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">บันทึกกิจกรรม</h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-92">
            <SummaryChip icon={<ClockIcon />} label="ล่าสุด" value={summary.lastUpdatedLabel ?? "-"} />
            <SummaryChip
              icon={<ActivityIcon />}
              label="ทั้งหมด"
              value={summary.totalLogs.toLocaleString("th-TH")}
              subvalue={`${filteredLogs.length.toLocaleString("th-TH")} รายการที่แสดง`}
            />
          </div>
        </div>

        <section className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
            ผู้ดูแล {roleCounts.admin.toLocaleString("th-TH")}
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
            นักศึกษา {roleCounts.student.toLocaleString("th-TH")}
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
            แสดง {filteredLogs.length.toLocaleString("th-TH")}
          </span>
        </section>

        <section className="mt-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-admin/10 text-(--color-admin)">
                  <ActivityIcon />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">รายการทั้งหมด</h2>
                </div>
              </div>

              <div className="flex flex-col gap-2 xl:min-w-160">
                <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                  <label className="relative block flex-1">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <SearchIcon />
                    </span>
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="ค้นหา"
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-admin/30 focus:bg-white focus:ring-4 focus:ring-admin/10"
                    />
                  </label>

                  <AppDatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    placeholder="เลือกวันที่"
                    tone="admin"
                    size="md"
                    startYear={CURRENT_YEAR - 3}
                    endYear={CURRENT_YEAR + 1}
                    wrapperClassName="min-w-48"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    {datePresets.map((preset) => {
                      const active = selectedDate === preset.value;

                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setSelectedDate(preset.value)}
                          className={active
                            ? "inline-flex h-10 items-center rounded-full bg-admin px-3 text-xs font-medium text-white shadow-sm shadow-admin/20"
                            : "inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  <FilterSelect value={roleFilter} onChange={setRoleFilter} options={roleOptions} />
                  <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} />
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setRoleFilter("all");
                        setCategoryFilter("all");
                        setSelectedDate("");
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      ล้าง
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {selectedDateLabel ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                      วันที่ {selectedDateLabel}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                    แสดง {filteredLogs.length.toLocaleString("th-TH")} รายการ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {activityLogs.length === 0 ? (
            <div className="flex min-h-105 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-admin/8 text-(--color-admin)">
                <EmptyIcon />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">ยังไม่มีกิจกรรม</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                เมื่อมีการส่งฟอร์ม แก้ไขข้อมูล อัปโหลดไฟล์ หรือเปลี่ยนสถานะ รายการจะปรากฏที่นี่โดยอัตโนมัติ
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex min-h-85 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-18 w-18 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <SearchIcon />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">ไม่พบกิจกรรมที่ตรงกับเงื่อนไข</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                ลองค้นหาด้วยชื่อผู้ใช้งาน อีเมล นักศึกษา หรือสลับตัวกรองเพื่อดูรายการทั้งหมดอีกครั้ง
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setRoleFilter("all");
                  setCategoryFilter("all");
                  setSelectedDate("");
                }}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ล้างตัวกรอง
              </button>
            </div>
          ) : (
            <div className="px-5 sm:px-6">
              {groupedLogs.map((group) => (
                <section key={group.label} className="py-3 first:pt-4 last:pb-4">
                  <div className="sticky top-0 z-10 mb-2 bg-white/95 py-2 text-sm font-semibold text-gray-900 backdrop-blur">
                    {group.label}
                  </div>
                  <div>
                    {group.items.map((entry) => {
                      const actionBadge = getActionBadge(entry);

                      return (
                        <Link
                          key={entry.id}
                          href={entry.targetPath}
                          className="group block border-b border-gray-100 py-4 last:border-b-0"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
                              {getActorIcon(entry.actorRole)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex min-w-0 items-start gap-4">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-gray-900">{entry.actorLabel}</p>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getRolePillClass(entry.actorRole)}`}>
                                      {getActorRoleLabel(entry.actorRole)}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${actionBadge.className}`}>
                                      {actionBadge.icon}
                                      {entry.actionLabel}
                                    </span>
                                  </div>
                                  <div className="mt-1 space-y-1 text-sm text-gray-500">
                                    {entry.actorEmail ? <p className="truncate">{entry.actorEmail}</p> : null}
                                    <p className="line-clamp-2">{entry.message}</p>
                                    <p className="truncate">{entry.studentLabel} · {entry.studentEmail}</p>
                                  </div>
                                </div>

                                <div className="shrink-0 pl-3 text-right text-sm text-gray-400">
                                  {timeOnlyFormatter.format(new Date(entry.createdAtIso))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </main>
    </AdminLayoutShell>
  );
}
