"use client";

import { markNotificationReadAction } from "@/app/intern/dashboard/actions";
import type { AdminNotificationItem } from "@/lib/admin/notifications";

export function AdminNotificationFeed({
  items,
  compact = false,
  maxHeightClass,
  variant = "default",
}: {
  items: AdminNotificationItem[];
  compact?: boolean;
  maxHeightClass?: string;
  variant?: "default" | "drawer" | "page";
}) {
  if (items.length === 0) {
    return <div className="px-3 py-5 text-center text-[11px] text-slate-500 sm:px-5">ยังไม่มีการแจ้งเตือน</div>;
  }

  return (
    <div className={maxHeightClass ? `${maxHeightClass} overflow-y-auto divide-y divide-slate-200` : "divide-y divide-slate-200"}>
      {items.map((notification) => (
        <form key={notification.id} action={markNotificationReadAction}>
          <input type="hidden" name="notificationEventId" value={notification.id} />
          <input type="hidden" name="targetPath" value={notification.targetPath} />
          <button
            type="submit"
            className={variant === "drawer"
              ? "flex min-h-13 w-full items-center gap-2 px-2.5 py-2 text-left transition hover:bg-slate-50"
              : variant === "page"
                ? "flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
              : `flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6 ${compact ? "pr-4 sm:pr-5" : ""}`}
          >
            <div className={variant === "drawer" ? "shrink-0" : "pt-1"}>
              <span
                className={`block rounded-full ${variant === "drawer" ? "h-2 w-2" : "h-2.5 w-2.5"} ${notification.isRead ? "bg-slate-200" : "bg-(--color-admin)"}`}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1">
              {variant === "drawer" ? (
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium leading-4 text-slate-900">{notification.title}</p>
                    <p className="truncate text-[11px] leading-4 text-slate-500">{notification.message}</p>
                  </div>
                  <p className="shrink-0 text-right text-[10px] font-medium leading-4 text-slate-400">
                    {notification.createdAtLabel}
                  </p>
                </div>
              ) : variant === "page" ? (
                <div className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{notification.title}</p>
                    <p className="mt-1 truncate text-sm text-slate-500">{notification.message}</p>
                  </div>
                  <p className="shrink-0 text-xs font-medium text-slate-400">{notification.createdAtLabel}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                    <p className="shrink-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                      {notification.createdAtLabel}
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                </>
              )}
            </div>
          </button>
        </form>
      ))}
    </div>
  );
}
