"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { logoutAction } from "@/app/intern/dashboard/actions";
import { AdminLayoutShell, type AdminShellNavItem } from "@/components/admin/admin-layout-shell";
import {
  filterAdminActivityLogs,
  getActorRoleLabel,
  type ActivityCategoryFilter,
  type ActivityRoleFilter,
  type AdminActivityCategory,
  type AdminActivityLogItem,
} from "@/lib/admin/activity-log-shared";
import { appShellClass } from "@/lib/page-shell";

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

  return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function FilterButton({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active
        ? "inline-flex items-center gap-2 rounded-full bg-admin px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-admin/20"
        : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-admin/25 hover:text-(--color-admin)"}
    >
      <span>{label}</span>
      <span className={active ? "text-white/90" : "text-slate-400"}>{count}</span>
    </button>
  );
}

export function AdminActivityLogPage({
  currentUser,
  activityLogs,
  summary,
}: AdminActivityLogPageProps) {
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

  const filteredLogs = filterAdminActivityLogs(activityLogs, {
    query: normalizedQuery,
    role: roleFilter,
    category: categoryFilter,
  });

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
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
            พื้นที่ผู้ดูแลระบบ
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Activity Log
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            ดูกิจกรรมทั้งหมดของผู้ดูแลและนักศึกษาจากทุกฟอร์มในที่เดียว พร้อมเวลาที่อัปเดตล่าสุดและผู้ที่ดำเนินการล่าสุด
          </p>
        </div>

        <section className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
          <article className="overflow-hidden rounded-[30px] border border-admin/10 bg-linear-to-br from-admin/12 via-white to-white shadow-xl shadow-slate-900/5">
            <div className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-admin) ring-1 ring-admin/10 backdrop-blur">
                  <ActivityIcon />
                  Activity Center
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  เห็นภาพการเปลี่ยนแปลงทั้งหมดได้ในจุดเดียว
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                  ตรวจสอบว่าใครเป็นคนแก้ไขอะไร เมื่อไร และเปิดไปยังรายละเอียดของนักศึกษาคนนั้นได้ทันทีโดยไม่ต้องไล่หลายหน้า
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-90 lg:grid-cols-1 xl:grid-cols-3">
                <article className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm shadow-slate-900/5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <ClockIcon />
                    ล่าสุด
                  </div>
                  <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                    {summary.lastUpdatedLabel ?? "ยังไม่มีกิจกรรม"}
                  </p>
                </article>

                <article className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm shadow-slate-900/5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <UserIcon />
                    ล่าสุดโดย
                  </div>
                  <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                    {summary.lastUpdatedByLabel ?? "ยังไม่ระบุ"}
                  </p>
                  {summary.lastUpdatedByEmail ? (
                    <p className="mt-1 truncate text-xs text-slate-500">{summary.lastUpdatedByEmail}</p>
                  ) : null}
                </article>

                <article className="rounded-3xl border border-white/80 bg-slate-950 p-4 text-white shadow-sm shadow-slate-900/15">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">กิจกรรมทั้งหมด</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">
                    {summary.totalLogs.toLocaleString("th-TH")}
                  </p>
                </article>
              </div>
            </div>
          </article>

          <aside className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <article className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6">
              <p className="text-sm font-medium text-slate-500">กิจกรรมจากผู้ดูแล</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {roleCounts.admin.toLocaleString("th-TH")}
              </p>
              <p className="mt-2 text-sm text-slate-500">รวมทั้งผู้ดูแลระบบและผู้ดูแลสูงสุด</p>
            </article>

            <article className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6">
              <p className="text-sm font-medium text-slate-500">กิจกรรมจากนักศึกษา</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {roleCounts.student.toLocaleString("th-TH")}
              </p>
              <p className="mt-2 text-sm text-slate-500">ช่วยแยกดูการเคลื่อนไหวที่เกิดจากการส่งและแก้ไขฟอร์ม</p>
            </article>

            <article className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6">
              <p className="text-sm font-medium text-slate-500">รายการที่กำลังแสดง</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {filteredLogs.length.toLocaleString("th-TH")}
              </p>
              <p className="mt-2 text-sm text-slate-500">อัปเดตตามคำค้นหาและตัวกรองที่คุณเลือกทันที</p>
            </article>
          </aside>
        </section>

        <section className="mt-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-admin/10 text-(--color-admin)">
                    <ActivityIcon />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-950">กิจกรรมทั้งหมด</h2>
                    <p className="mt-1 text-sm text-slate-500">ค้นหา แยกตามบทบาท และเปิดไปยังหน้ารายละเอียดนักศึกษาที่เกี่ยวข้องได้ทันที</p>
                  </div>
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
                    placeholder="ค้นหาจากชื่อผู้ทำรายการ อีเมล นักศึกษา หรือข้อความกิจกรรม"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-admin/30 focus:bg-white focus:ring-4 focus:ring-admin/10"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <FilterButton
                    active={roleFilter === "all"}
                    count={roleCounts.all}
                    label="ทั้งหมด"
                    onClick={() => setRoleFilter("all")}
                  />
                  <FilterButton
                    active={roleFilter === "admin"}
                    count={roleCounts.admin}
                    label="ผู้ดูแล"
                    onClick={() => setRoleFilter("admin")}
                  />
                  <FilterButton
                    active={roleFilter === "student"}
                    count={roleCounts.student}
                    label="นักศึกษา"
                    onClick={() => setRoleFilter("student")}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <FilterButton
                    active={categoryFilter === "all"}
                    count={categoryCounts.all}
                    label="ทุกประเภท"
                    onClick={() => setCategoryFilter("all")}
                  />
                  <FilterButton
                    active={categoryFilter === "submission"}
                    count={categoryCounts.submission}
                    label="ส่งฟอร์ม"
                    onClick={() => setCategoryFilter("submission")}
                  />
                  <FilterButton
                    active={categoryFilter === "edit"}
                    count={categoryCounts.edit}
                    label="แก้ไขข้อมูล"
                    onClick={() => setCategoryFilter("edit")}
                  />
                  <FilterButton
                    active={categoryFilter === "file"}
                    count={categoryCounts.file}
                    label="ไฟล์"
                    onClick={() => setCategoryFilter("file")}
                  />
                  <FilterButton
                    active={categoryFilter === "status"}
                    count={categoryCounts.status}
                    label="สถานะ"
                    onClick={() => setCategoryFilter("status")}
                  />
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
                  className="group block px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-admin/10 text-sm font-semibold text-(--color-admin)">
                        {getActorInitials(entry.actorLabel)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-950">{entry.actorLabel}</p>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getRolePillClass(entry.actorRole)}`}>
                            {getActorRoleLabel(entry.actorRole)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {entry.actionLabel}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-slate-950 px-2.5 py-1 text-xs font-medium text-white">
                            {entry.actionCategoryLabel}
                          </span>
                        </div>
                        {entry.actorEmail ? (
                          <p className="mt-1 text-xs text-slate-400">{entry.actorEmail}</p>
                        ) : null}
                        <p className="mt-3 text-sm leading-6 text-slate-600">{entry.message}</p>
                        <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                            <span className="truncate">นักศึกษา: {entry.studentLabel}</span>
                            <span className="truncate">{entry.studentEmail}</span>
                          </div>
                          <span className="text-(--color-admin) transition group-hover:translate-x-0.5 group-hover:opacity-90">
                            เปิดหน้ารายละเอียด
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 lg:pt-1">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left lg:min-w-33 lg:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {entry.relativeTimeLabel}
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {entry.createdAtLabel}
                        </p>
                      </div>
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