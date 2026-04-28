"use client";

import Link from "next/link";
import { useDeferredValue, useState, type ReactNode } from "react";
import { logoutAction } from "../../app/intern/dashboard/actions";
import { AdminLayoutShell, type AdminShellNavItem } from "./admin-layout-shell";
import {
  filterAdminActivityLogs,
  getActorRoleLabel,
  type ActivityCategoryFilter,
  type ActivityRoleFilter,
  type AdminActivityLogItem,
} from "../../lib/admin/activity-log-shared";
import { appShellClass } from "../../lib/page-shell";

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

const ADMIN_NAV_ITEMS: AdminShellNavItem[] = [
  { href: "/intern/dashboard", label: "แดชบอร์ด" },
  { href: "/intern/admin/students", label: "รายชื่อนักศึกษา", match: "prefix" },
  { href: "/intern/notifications", label: "การแจ้งเตือน" },
  { href: "/intern/activity-logs", label: "Activity Log" },
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <circle cx="8.5" cy="8.5" r="5.75" />
      <path d="m13 13 4.25 4.25" />
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

function getActorInitials(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "--";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function SummaryChip({ icon, label, value, subvalue }: SummaryChipProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-900/5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-base font-semibold tracking-tight text-slate-950">{value}</p>
      {subvalue ? <p className="mt-1 truncate text-xs text-slate-500">{subvalue}</p> : null}
    </article>
  );
}

function FilterSelect<T extends string>({ value, onChange, options }: FilterSelectProps<T>) {
  return (
    <label className="relative block min-w-42">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-10 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-admin/30 focus:ring-4 focus:ring-admin/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.count})
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">▾</span>
    </label>
  );
}

export function AdminActivityLogPage({ currentUser, activityLogs, summary }: AdminActivityLogPageProps) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<ActivityRoleFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategoryFilter>("all");
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
  });

  const hasActiveFilters = query.length > 0 || roleFilter !== "all" || categoryFilter !== "all";

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
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
              พื้นที่ผู้ดูแลระบบ
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Activity Log</h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-135">
            <SummaryChip icon={<ClockIcon />} label="ล่าสุด" value={summary.lastUpdatedLabel ?? "-"} />
            <SummaryChip
              icon={<UserIcon />}
              label="อัปเดตโดย"
              value={summary.lastUpdatedByLabel ?? "-"}
              subvalue={summary.lastUpdatedByEmail}
            />
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
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">กิจกรรมทั้งหมด</h2>
                  <p className="mt-1 text-sm text-slate-500">ค้นหาและกรองรายการ</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:min-w-115">
                <label className="relative block">
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

                <div className="flex flex-col gap-2 sm:flex-row">
                  <FilterSelect value={roleFilter} onChange={setRoleFilter} options={roleOptions} />
                  <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} />
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setRoleFilter("all");
                        setCategoryFilter("all");
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      ล้าง
                    </button>
                  ) : null}
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
                }}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ล้างตัวกรอง
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredLogs.map((entry) => (
                <Link
                  key={entry.id}
                  href={entry.targetPath}
                  className="group block px-5 py-3.5 transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_130px] lg:items-start">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-xs font-semibold text-(--color-admin)">
                        {getActorInitials(entry.actorLabel)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">{entry.actorLabel}</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${getRolePillClass(entry.actorRole)}`}>
                            {getActorRoleLabel(entry.actorRole)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                            {entry.actionLabel}
                          </span>
                        </div>
                        {entry.actorEmail ? <p className="mt-1 text-xs text-slate-400">{entry.actorEmail}</p> : null}
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{entry.message}</p>
                        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="truncate font-medium text-slate-600">{entry.studentLabel}</span>
                          <span className="truncate">{entry.studentEmail}</span>
                          <span className="text-(--color-admin) transition group-hover:translate-x-0.5 group-hover:opacity-90">
                            ดูรายละเอียด
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left lg:text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {entry.relativeTimeLabel}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-700">{entry.createdAtLabel}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </AdminLayoutShell>
  );
}
