"use client";

import { useState } from "react";
import { logoutAction, markAllNotificationsReadAction } from "@/app/intern/dashboard/actions";
import { AdminLayoutShell, type AdminShellNavItem } from "@/components/admin/admin-layout-shell";
import { AdminNotificationFeed } from "@/components/admin/admin-notification-menu";
import type { AdminNotificationItem } from "@/lib/admin/notifications";

type AdminNotificationsPageProps = {
  currentUser: {
    email: string;
    name: string | null;
  };
  allNotifications: AdminNotificationItem[];
  unreadNotifications: AdminNotificationItem[];
  roleLabel?: string;
};

type NotificationTab = "all" | "unread";

const ADMIN_NAV_ITEMS: AdminShellNavItem[] = [
  { href: "/intern/dashboard", label: "แดชบอร์ด" },
  { href: "/intern/admin/students", label: "รายชื่อนักศึกษา", match: "prefix" },
  { href: "/intern/notifications", label: "การแจ้งเตือน" },
  { href: "/intern/activity-logs", label: "Activity Log" },
];

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-4 w-4">
      <path d="M10 3.25a3.75 3.75 0 0 0-3.75 3.75v1.65c0 .78-.23 1.53-.65 2.2L4.5 12.5h11l-1.1-1.65a4 4 0 0 1-.65-2.2V7A3.75 3.75 0 0 0 10 3.25Z" />
      <path d="M8 15.25a2 2 0 0 0 4 0" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="h-14 w-14">
      <rect x="10" y="14" width="44" height="36" rx="10" className="fill-admin/10 stroke-admin/25" strokeWidth="2" />
      <path d="M20 26h24" className="stroke-admin/45" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 36h14" className="stroke-admin/35" strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="41" r="8" className="fill-(--color-admin) text-white" />
      <path d="M42.5 41h7" className="stroke-current" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function TabButton({
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

export function AdminNotificationsPage({
  currentUser,
  allNotifications,
  unreadNotifications,
  roleLabel = "ผู้ดูแลระบบ",
}: AdminNotificationsPageProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");
  const visibleNotifications = activeTab === "all" ? allNotifications : unreadNotifications;

  return (
    <AdminLayoutShell
      currentPath="/intern/notifications"
      currentUser={currentUser}
      homeHref="/intern/dashboard"
      logoutAction={logoutAction}
      navItems={ADMIN_NAV_ITEMS}
      roleLabel={roleLabel}
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-admin)">
            พื้นที่ผู้ดูแลระบบ
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            การแจ้งเตือน
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            ตรวจสอบกิจกรรมล่าสุด เปิดอ่านรายการที่ยังไม่อ่าน และไปยังหน้ารายละเอียดที่เกี่ยวข้องได้ทันที
          </p>
        </div>

        <section className="mt-8 rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <TabButton
                active={activeTab === "all"}
                count={allNotifications.length}
                label="ทั้งหมด"
                onClick={() => setActiveTab("all")}
              />
              <TabButton
                active={activeTab === "unread"}
                count={unreadNotifications.length}
                label="ยังไม่อ่าน"
                onClick={() => setActiveTab("unread")}
              />
            </div>

            {unreadNotifications.length > 0 ? (
              <form action={markAllNotificationsReadAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full border border-admin/15 bg-admin/6 px-4 py-2 text-sm font-medium text-(--color-admin) transition hover:opacity-80"
                >
                  อ่านทั้งหมดแล้ว
                </button>
              </form>
            ) : null}
          </div>

          {visibleNotifications.length === 0 ? (
            <div className="flex min-h-105 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-admin/8 text-(--color-admin)">
                <EmptyIcon />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">
                {activeTab === "all" ? "ยังไม่มีการแจ้งเตือน" : "ไม่มีรายการที่ยังไม่อ่าน"}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {activeTab === "all"
                  ? "เมื่อมีการส่งหรืออัปเดตแบบฟอร์มของนักศึกษา รายการจะแสดงที่นี่โดยอัตโนมัติ"
                  : "รายการที่ยังไม่อ่านจะกลับมาแสดงที่นี่เมื่อมีการแจ้งเตือนใหม่เข้ามา"}
              </p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-17rem)] overflow-y-auto">
              <div className="flex items-center gap-3 border-b border-slate-200/80 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:px-6">
                <BellIcon />
                <span>คลิกที่รายการเพื่ออ่านและเปิดหน้าที่เกี่ยวข้อง</span>
              </div>
              <AdminNotificationFeed items={visibleNotifications} variant="page" />
            </div>
          )}
        </section>
      </main>
    </AdminLayoutShell>
  );
}