"use client";

import { useState } from "react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/intern/dashboard/actions";
import type { AdminNotificationItem } from "@/lib/admin/notifications";

type AdminNotificationMenuProps = {
  unreadNotificationCount: number;
  notifications: AdminNotificationItem[];
};

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-5 w-5">
      <path d="M10 3.25a3.75 3.75 0 0 0-3.75 3.75v1.65c0 .78-.23 1.53-.65 2.2L4.5 12.5h11l-1.1-1.65a4 4 0 0 1-.65-2.2V7A3.75 3.75 0 0 0 10 3.25Z" />
      <path d="M8 15.25a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function AdminNotificationFeed({
  items,
  compact = false,
}: {
  items: AdminNotificationItem[];
  compact?: boolean;
}) {
  if (items.length === 0) {
    return <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">ยังไม่มีการแจ้งเตือน</div>;
  }

  return (
    <div className="divide-y divide-slate-200">
      {items.map((notification) => (
        <form key={notification.id} action={markNotificationReadAction}>
          <input type="hidden" name="notificationEventId" value={notification.id} />
          <input type="hidden" name="targetPath" value={notification.targetPath} />
          <button
            type="submit"
            className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6 ${compact ? "pr-4 sm:pr-5" : ""}`}
          >
            <div className="pt-1">
              <span
                className={`block h-2.5 w-2.5 rounded-full ${notification.isRead ? "bg-slate-200" : "bg-(--color-admin)"}`}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  {notification.createdAtLabel}
                </p>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
            </div>
          </button>
        </form>
      ))}
    </div>
  );
}

export function AdminNotificationMenu({ unreadNotificationCount, notifications }: AdminNotificationMenuProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setNotificationsOpen((open) => !open)}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        aria-label="เปิดการแจ้งเตือน"
        aria-expanded={notificationsOpen}
      >
        <BellIcon />
        {unreadNotificationCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-(--color-admin) px-1.5 text-[11px] font-semibold text-white">
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        ) : null}
      </button>

      {notificationsOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="ปิดการแจ้งเตือน"
            onClick={() => setNotificationsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-3 w-[24rem] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/12">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">การแจ้งเตือน</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">ยังไม่อ่าน {unreadNotificationCount} รายการ</p>
              </div>
              {unreadNotificationCount > 0 ? (
                <form action={markAllNotificationsReadAction}>
                  <button type="submit" className="text-sm font-medium text-(--color-admin) transition hover:opacity-80">
                    อ่านทั้งหมดแล้ว
                  </button>
                </form>
              ) : null}
            </div>
            <AdminNotificationFeed items={notifications.slice(0, 4)} compact />
          </div>
        </>
      ) : null}
    </div>
  );
}

export function AdminMobileNotificationsCard({
  unreadNotificationCount,
  notifications,
  compactCount = 3,
}: AdminNotificationMenuProps & {
  compactCount?: number;
}) {
  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">การแจ้งเตือน</p>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">ยังไม่อ่าน {unreadNotificationCount} รายการ</p>
        </div>
        {unreadNotificationCount > 0 ? (
          <form action={markAllNotificationsReadAction}>
            <button type="submit" className="text-sm font-medium text-(--color-admin)">
              อ่านทั้งหมดแล้ว
            </button>
          </form>
        ) : null}
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <AdminNotificationFeed items={notifications.slice(0, compactCount)} compact />
      </div>
    </div>
  );
}