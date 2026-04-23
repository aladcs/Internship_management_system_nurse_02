"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AdminMobileNotificationsCard,
  AdminNotificationFeed,
  AdminNotificationMenu,
} from "@/components/admin/admin-notification-menu";
import { logoutAction, markAllNotificationsReadAction } from "@/app/intern/dashboard/actions";
import type { AdminNotificationItem } from "@/lib/admin/notifications";

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
  unreadNotificationCount: number;
  recentStudents: RecentStudent[];
  notifications: AdminNotificationItem[];
};

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

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
  hint,
  icon,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <article className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
          {icon}
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Live</p>
      </div>
      <div className="mt-6 space-y-2">
        <p className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{value}</p>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-sm leading-6 text-slate-500">{hint}</p>
      </div>
    </article>
  );
}

export function AdminDashboardPage({
  currentUser,
  stats,
  unreadNotificationCount,
  recentStudents,
  notifications,
}: AdminDashboardPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbf7f4] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/intern/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Image
                  src="/nurse_logo.svg"
                  alt="Internship Management System"
                  width={30}
                  height={30}
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-admin)">
                  Internship
                </p>
                <p className="text-sm font-medium text-slate-700">Management System</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              <Link
                href="/intern/dashboard"
                className="rounded-full bg-admin/12 px-4 py-2 text-sm font-semibold text-(--color-admin)"
                aria-current="page"
              >
                Dashboard
              </Link>
              <Link
                href="/intern/admin/students"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Student List
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <AdminNotificationMenu unreadNotificationCount={unreadNotificationCount} notifications={notifications} />

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{currentUser.name ?? "Admin"}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm md:hidden"
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="ml-auto flex h-full w-[84%] max-w-sm flex-col bg-white px-5 py-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{currentUser.name ?? "Admin"}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{currentUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-700"
                aria-label="Close navigation menu"
              >
                <span className="text-lg">×</span>
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              <Link
                href="/intern/dashboard"
                className="block rounded-2xl bg-admin/12 px-4 py-3 text-sm font-semibold text-(--color-admin)"
                aria-current="page"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/intern/admin/students"
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Student List
              </Link>
            </nav>

            <AdminMobileNotificationsCard unreadNotificationCount={unreadNotificationCount} notifications={notifications} />

            <div className="mt-auto pt-8">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Logout
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
            Admin Workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Track student progress, watch current internship statuses, and review the latest notification activity from one place.
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Students"
            value={stats.totalStudents}
            hint="All student internship records in the system."
            icon={<UsersIcon />}
            tone="bg-admin/12 text-(--color-admin)"
          />
          <StatCard
            label="Pending"
            value={stats.pendingStudents}
            hint="Students waiting for admin review after submission."
            icon={<PendingIcon />}
            tone="bg-amber-100 text-amber-700"
          />
          <StatCard
            label="In Progress"
            value={stats.inProgressStudents}
            hint="Active internships that can still receive updates."
            icon={<ProgressIcon />}
            tone="bg-sky-100 text-sky-700"
          />
          <StatCard
            label="Completed"
            value={stats.completedStudents}
            hint="Closed records that are now read-only for students."
            icon={<CompleteIcon />}
            tone="bg-emerald-100 text-emerald-700"
          />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 xl:col-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">Recent Students</h2>
                <p className="mt-1 text-sm text-slate-500">The most recently updated student records.</p>
              </div>
              <Link
                href="/intern/admin/students"
                className="inline-flex items-center gap-1 text-sm font-medium text-(--color-admin) transition hover:opacity-80"
              >
                View all
                <ArrowRightIcon />
              </Link>
            </div>

            {recentStudents.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500 sm:px-6">
                No students have been created yet.
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

          <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">Notifications</h2>
                <p className="mt-1 text-sm text-slate-500">Latest student submission and update events.</p>
              </div>
              {unreadNotificationCount > 0 ? (
                <form action={markAllNotificationsReadAction}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-(--color-admin) transition hover:opacity-80"
                  >
                    Mark all read
                  </button>
                </form>
              ) : null}
            </div>
            <AdminNotificationFeed items={notifications} />
          </article>
        </section>
      </main>
    </div>
  );
}