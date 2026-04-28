"use client";

import { useDeferredValue, useState } from "react";
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
type NotificationTypeFilter = "all" | "submission" | "resubmission" | "form_update" | "file_update";

type FilterSelectProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: Array<{
    value: T;
    label: string;
    count: number;
  }>;
};

type DatePreset = {
  value: string;
  label: string;
};

type GroupedNotifications = {
  label: string;
  items: AdminNotificationItem[];
};

const DISPLAY_TIME_ZONE = "Asia/Bangkok";

const dateHeaderFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: DISPLAY_TIME_ZONE,
});

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: DISPLAY_TIME_ZONE,
});

const selectedDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: DISPLAY_TIME_ZONE,
});

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

function getDateKey(value: string) {
  return dateKeyFormatter.format(new Date(value));
}

function getDateOffsetValue(offsetDays: number, now = new Date()) {
  const date = new Date(now);
  date.setDate(now.getDate() + offsetDays);

  return getDateKey(date.toISOString());
}

function formatSelectedDateLabel(value: string) {
  if (!value) {
    return "";
  }

  return selectedDateFormatter.format(new Date(`${value}T00:00:00+07:00`));
}

function getDateGroupLabel(value: string, now = new Date()) {
  const currentKey = getDateKey(now.toISOString());
  const valueKey = getDateKey(value);

  if (valueKey === currentKey) {
    return "Today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (valueKey === getDateKey(yesterday.toISOString())) {
    return "Yesterday";
  }

  return dateHeaderFormatter.format(new Date(value));
}

function groupNotificationsByDate(items: AdminNotificationItem[]) {
  const groups: GroupedNotifications[] = [];

  for (const item of items) {
    const label = getDateGroupLabel(item.createdAtIso);
    const lastGroup = groups.at(-1);

    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(item);
      continue;
    }

    groups.push({
      label,
      items: [item],
    });
  }

  return groups;
}

function getNotificationTypeFilter(type: string): NotificationTypeFilter {
  if (type === "form_submitted") {
    return "submission";
  }

  if (type === "form_resubmitted") {
    return "resubmission";
  }

  if (type === "form_updated" || type === "form_updated_in_progress") {
    return "form_update";
  }

  if (type === "file_changed_in_progress") {
    return "file_update";
  }

  return "all";
}

function getNotificationTypeLabel(type: NotificationTypeFilter) {
  if (type === "submission") {
    return "ส่งฟอร์มครั้งแรก";
  }

  if (type === "resubmission") {
    return "ส่งกลับมาอีกครั้ง";
  }

  if (type === "form_update") {
    return "แก้ไขข้อมูลฝึกงาน";
  }

  if (type === "file_update") {
    return "เปลี่ยนไฟล์แนบ";
  }

  return "ทุกประเภท";
}

function filterNotifications(items: AdminNotificationItem[], input: {
  query: string;
  type: NotificationTypeFilter;
  selectedDate: string;
}) {
  return items.filter((item) => {
    const matchesQuery = input.query.length === 0
      ? true
      : [item.studentName, item.title, item.message]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(input.query));

    const matchesType = input.type === "all"
      ? true
      : getNotificationTypeFilter(item.type) === input.type;

    const matchesDate = input.selectedDate.length === 0
      ? true
      : getDateKey(item.createdAtIso) === input.selectedDate;

    return matchesQuery && matchesType && matchesDate;
  });
}

export function AdminNotificationsPage({
  currentUser,
  allNotifications,
  unreadNotifications,
  roleLabel = "ผู้ดูแลระบบ",
}: AdminNotificationsPageProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>("all");
  const [selectedDate, setSelectedDate] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const baseNotifications = activeTab === "all" ? allNotifications : unreadNotifications;
  const visibleNotifications = filterNotifications(baseNotifications, {
    query: normalizedQuery,
    type: typeFilter,
    selectedDate,
  });
  const typeCounts = {
    all: baseNotifications.length,
    submission: baseNotifications.filter((item) => getNotificationTypeFilter(item.type) === "submission").length,
    resubmission: baseNotifications.filter((item) => getNotificationTypeFilter(item.type) === "resubmission").length,
    form_update: baseNotifications.filter((item) => getNotificationTypeFilter(item.type) === "form_update").length,
    file_update: baseNotifications.filter((item) => getNotificationTypeFilter(item.type) === "file_update").length,
  };
  const typeOptions: FilterSelectProps<NotificationTypeFilter>["options"] = [
    { value: "all", label: "ทุกประเภท", count: typeCounts.all },
    { value: "submission", label: "ส่งฟอร์มครั้งแรก", count: typeCounts.submission },
    { value: "resubmission", label: "ส่งกลับมาอีกครั้ง", count: typeCounts.resubmission },
    { value: "form_update", label: "แก้ไขข้อมูลฝึกงาน", count: typeCounts.form_update },
    { value: "file_update", label: "เปลี่ยนไฟล์แนบ", count: typeCounts.file_update },
  ];
  const datePresets: DatePreset[] = [
    { value: getDateOffsetValue(0), label: "Today" },
    { value: getDateOffsetValue(-1), label: "Yesterday" },
    { value: getDateOffsetValue(-7), label: "7 days ago" },
  ];
  const groupedNotifications = groupNotificationsByDate(visibleNotifications);
  const selectedDateLabel = formatSelectedDateLabel(selectedDate);
  const hasActiveFilters = query.length > 0 || typeFilter !== "all" || selectedDate.length > 0;

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
                  className="text-sm font-medium text-(--color-admin) transition hover:text-admin/80"
                >
                  อ่านทั้งหมดแล้ว
                </button>
              </form>
            ) : null}
          </div>

          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-admin/10 text-(--color-admin)">
                  <BellIcon />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">รายการแจ้งเตือน</h2>
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
                      placeholder="ค้นหาชื่อนักศึกษา หัวข้อ หรือรายละเอียด"
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-admin/30 focus:bg-white focus:ring-4 focus:ring-admin/10"
                    />
                  </label>

                  <label className="relative block min-w-48">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <CalendarIcon />
                    </span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-admin/30 focus:bg-white focus:ring-4 focus:ring-admin/10"
                    />
                  </label>

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

                  <FilterSelect value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setTypeFilter("all");
                        setSelectedDate("");
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      ล้าง
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                    {activeTab === "all" ? "ทั้งหมด" : "ยังไม่อ่าน"} {baseNotifications.length.toLocaleString("th-TH")}
                  </span>
                  {typeFilter !== "all" ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                      ประเภท {getNotificationTypeLabel(typeFilter)}
                    </span>
                  ) : null}
                  {selectedDateLabel ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                      วันที่ {selectedDateLabel}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                    แสดง {visibleNotifications.length.toLocaleString("th-TH")} รายการ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {baseNotifications.length === 0 ? (
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
          ) : visibleNotifications.length === 0 ? (
            <div className="flex min-h-85 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-18 w-18 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <SearchIcon />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">ไม่พบการแจ้งเตือนที่ตรงกับเงื่อนไข</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                ลองค้นหาด้วยชื่อนักศึกษา หัวข้อการแจ้งเตือน หรือเปลี่ยนตัวกรองเพื่อดูรายการทั้งหมดอีกครั้ง
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setTypeFilter("all");
                  setSelectedDate("");
                }}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ล้างตัวกรอง
              </button>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-17rem)] overflow-y-auto">
              <div className="flex items-center gap-3 border-b border-slate-200/80 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:px-6">
                <BellIcon />
                <span>คลิกที่รายการเพื่ออ่านและเปิดหน้าที่เกี่ยวข้อง</span>
              </div>
              <div className="px-5 sm:px-6">
                {groupedNotifications.map((group) => (
                  <section key={group.label} className="py-3 first:pt-4 last:pb-4">
                    <div className="sticky top-0 z-10 mb-2 bg-white/95 py-2 text-sm font-semibold text-gray-900 backdrop-blur">
                      {group.label}
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80">
                      <AdminNotificationFeed items={group.items} variant="page" />
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </AdminLayoutShell>
  );
}