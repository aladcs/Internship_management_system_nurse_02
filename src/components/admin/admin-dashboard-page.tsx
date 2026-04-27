"use client";

import Link from "next/link";
import { logoutAction, markAllNotificationsReadAction } from "@/app/intern/dashboard/actions";
import { AdminLayoutShell, type AdminShellNavItem } from "@/components/admin/admin-layout-shell";
import { AdminNotificationFeed } from "@/components/admin/admin-notification-menu";
import type { AdminNotificationItem } from "@/lib/admin/notifications";
import { appShellClass } from "@/lib/page-shell";

type RecentStudent = {
  id: string;
  name: string;
  email: string;
  status: "pending" | "in_progress" | "completed";
  statusLabel: string;
  meta: string;
};

export type AdminDashboardPageProps = {
  currentUser: {
    email: string;
    name: string | null;
  };
  stats: {
    totalStudents: number;
    pendingStudents: number;
    inProgressStudents: number;
    completedStudents: number;
  };
  recentStudents: RecentStudent[];
  notifications: AdminNotificationItem[];
};

const ADMIN_NAV_ITEMS: AdminShellNavItem[] = [
  { href: "/intern/dashboard", label: "แดชบอร์ด" },
  { href: "/intern/admin/students", label: "รายชื่อนักศึกษา", match: "prefix" },
  { href: "/intern/notifications", label: "การแจ้งเตือน" },
];

function UsersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true" className="h-5 w-5">
      <path d="M2.75 15.25c1.12-2.38 2.98-3.58 5.13-3.58s4 1.2 5.12 3.58" />
      <path d="M11.75 13.5c.7-.58 1.55-.88 2.5-.88 1.75 0 3.25 1 4 2.63" />
      <circle cx="7.88" cy="7" r="2.88" />
      <circle cx="14.5" cy="7.5" r="2.25" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-5 w-5">
      <circle cx="10" cy="10" r="6.75" />
      <path d="M10 6.75v3.5l2.2 1.45" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-5 w-5">
      <path d="M4 11a6 6 0 1 1 2.08 4.56" />
      <path d="M2.75 14.75 6 15l.25-3.25" />
    </svg>
  );
}

function CompleteIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <circle cx="10" cy="10" r="6.75" />
      <path d="m6.75 10.15 2.15 2.15 4.35-4.6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-4 w-4">
      <path d="M4.5 10h10" />
      <path d="m10.5 6 4 4-4 4" />
    </svg>
  );
}

function getStatusClasses(status: RecentStudent["status"]) {
  if (status === "pending") {
    return "bg-amber-100 text-amber-800 ring-amber-200";
  }

  if (status === "in_progress") {
    return "bg-sky-100 text-sky-800 ring-sky-200";
  }

  return "bg-emerald-100 text-emerald-800 ring-emerald-200";
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <article className="h-full rounded-[26px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          {icon}
        </div>
        {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">สด</p> */}
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{value}</p>
        <p className="text-sm font-medium text-slate-700">{label}</p>
      </div>
    </article>
  );
}

export function AdminDashboardPage({
  currentUser,
  stats,
  recentStudents,
  notifications,
}: AdminDashboardPageProps) {
  const recentNotifications = notifications.slice(0, 5);

  return (
    <AdminLayoutShell
      currentPath="/intern/dashboard"
      currentUser={currentUser}
      homeHref="/intern/dashboard"
      logoutAction={logoutAction}
      navItems={ADMIN_NAV_ITEMS}
      roleLabel="ผู้ดูแลระบบ"
    >
      <main className={`${appShellClass} py-8 lg:py-10`}>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
            พื้นที่ผู้ดูแล
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            แดชบอร์ด
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            ติดตามความคืบหน้าของนักศึกษา ดูสถานะการฝึกงานปัจจุบัน และตรวจสอบการแจ้งเตือนล่าสุดได้จากที่เดียว
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="นักศึกษาทั้งหมด"
            value={stats.totalStudents}
            icon={<UsersIcon />}
            tone="bg-admin/12 text-(--color-admin)"
          />
          <StatCard
            label="รอดำเนินการ"
            value={stats.pendingStudents}
            icon={<PendingIcon />}
            tone="bg-amber-100 text-amber-700"
          />
          <StatCard
            label="กำลังฝึกงาน"
            value={stats.inProgressStudents}
            icon={<ProgressIcon />}
            tone="bg-sky-100 text-sky-700"
          />
          <StatCard
            label="เสร็จสิ้น"
            value={stats.completedStudents}
            icon={<CompleteIcon />}
            tone="bg-emerald-100 text-emerald-700"
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          <article className="h-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">นักศึกษาล่าสุด</h2>
                <p className="mt-1 text-sm text-slate-500">ข้อมูลนักศึกษาที่อัปเดตล่าสุด</p>
              </div>
              <Link
                href="/intern/admin/students"
                className="inline-flex items-center gap-1 text-sm font-medium text-(--color-admin) transition hover:opacity-80"
              >
                ดูทั้งหมด
                <ArrowRightIcon />
              </Link>
            </div>

            {recentStudents.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500 sm:px-6">
                ยังไม่มีการสร้างนักศึกษา
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {recentStudents.map((student) => (
                  <Link
                    key={student.id}
                    href={`/intern/admin/students/${student.id}`}
                    className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-student/12 text-sm font-semibold text-(--color-student)">
                      {getInitials(student.name, student.email)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{student.name}</p>
                          <p className="truncate text-sm text-slate-500">{student.email}</p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(student.status)}`}
                        >
                          {student.statusLabel}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{student.meta}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          <article id="notifications" className="h-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">การแจ้งเตือน</h2>
                <p className="mt-1 text-sm text-slate-500">รายการส่งข้อมูลและอัปเดตล่าสุดของนักศึกษา</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/intern/notifications" className="text-sm font-medium text-(--color-admin) transition hover:opacity-80">
                  ดูทั้งหมด
                </Link>
                {notifications.some((notification) => !notification.isRead) ? (
                  <form action={markAllNotificationsReadAction}>
                    <button
                      type="submit"
                      className="text-sm font-medium text-(--color-admin) transition hover:opacity-80"
                    >
                      อ่านทั้งหมดแล้ว
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
            <AdminNotificationFeed items={recentNotifications} maxHeightClass="max-h-[380px]" />
          </article>
        </section>
      </main>
    </AdminLayoutShell>
  );
}