"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { logoutAction, markAllNotificationsReadAction } from "@/app/intern/dashboard/actions";
import { AdminLayoutShell, type AdminShellNavItem } from "@/components/admin/admin-layout-shell";
import { AdminNotificationFeed } from "@/components/admin/admin-notification-menu";
import { AppDatePicker } from "@/components/ui/app-date-picker";
import { AppSelect } from "@/components/ui/app-select";
import type {
  AdminNotificationItem,
  AdminNotificationsFilter,
  AdminNotificationTypeFilter,
} from "@/lib/admin/notifications";

type AdminNotificationsPageProps = {
  currentUser: {
    email: string;
    name: string | null;
  };
  notifications: AdminNotificationItem[];
  allCount: number;
  unreadCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filter: AdminNotificationsFilter;
  searchQuery: string;
  typeFilter: AdminNotificationTypeFilter;
  dateFilter: string;
  roleLabel?: string;
};

type NotificationTab = "all" | "unread";

const CURRENT_YEAR = new Date().getUTCFullYear();

const NOTIFICATION_TYPE_OPTIONS: Array<{
  value: AdminNotificationTypeFilter;
  label: string;
}> = [
  { value: "all", label: "ทุกประเภท" },
  { value: "submission", label: "ส่งฟอร์มครั้งแรก" },
  { value: "resubmission", label: "ส่งกลับมาอีกครั้ง" },
  { value: "form_update", label: "แก้ไขข้อมูลฝึกงาน" },
  { value: "file_update", label: "เปลี่ยนไฟล์แนบ" },
];

function parseNotificationTypeFromUrl(value: string | null): AdminNotificationTypeFilter {
  return value === "submission" || value === "resubmission" || value === "form_update" || value === "file_update"
    ? value
    : "all";
}

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
  { href: "/intern/activity-logs", label: "บันทึกกิจกรรม" },
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

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <path d="m11.75 4.5-5.5 5.5 5.5 5.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4">
      <path d="m8.25 4.5 5.5 5.5-5.5 5.5" />
    </svg>
  );
}

function TabButton({
  active,
  count,
  label,
}: {
  active: boolean;
  count: number;
  label: string;
}) {
  return (
    <span
      className={active
        ? "inline-flex items-center gap-2 rounded-full bg-admin px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-admin/20"
        : "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-admin/25 hover:text-(--color-admin)"}
    >
      <span>{label}</span>
      <span className={active ? "text-white/90" : "text-slate-400"}>{count}</span>
    </span>
  );
}

function getDateGroupLabel(value: string) {
  return dateHeaderFormatter.format(new Date(value));
}

function formatSelectedDateLabel(value: string) {
  if (!value) {
    return "";
  }

  return selectedDateFormatter.format(new Date(`${value}T00:00:00+07:00`));
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

function buildNotificationsHref(input: {
  page?: number;
  filter: NotificationTab;
  searchQuery: string;
  typeFilter: AdminNotificationTypeFilter;
  dateFilter: string;
}) {
  const searchParams = new URLSearchParams();

  if (input.page && input.page > 1) {
    searchParams.set("page", String(input.page));
  }

  if (input.filter !== "all") {
    searchParams.set("filter", input.filter);
  }

  if (input.searchQuery.trim()) {
    searchParams.set("q", input.searchQuery.trim());
  }

  if (input.typeFilter !== "all") {
    searchParams.set("type", input.typeFilter);
  }

  if (input.dateFilter) {
    searchParams.set("date", input.dateFilter);
  }

  const queryString = searchParams.toString();

  return queryString ? `/intern/notifications?${queryString}` : "/intern/notifications";
}

function getNotificationsFilterQuery(input: {
  filter: NotificationTab;
  searchQuery: string;
  typeFilter: AdminNotificationTypeFilter;
  dateFilter: string;
}) {
  return buildNotificationsHref({
    page: 1,
    filter: input.filter,
    searchQuery: input.searchQuery,
    typeFilter: input.typeFilter,
    dateFilter: input.dateFilter,
  }).split("?")[1] ?? "";
}

export function AdminNotificationsPage({
  currentUser,
  notifications,
  allCount,
  unreadCount,
  totalCount,
  currentPage,
  totalPages,
  filter,
  searchQuery,
  typeFilter,
  dateFilter,
  roleLabel = "ผู้ดูแลระบบ",
}: AdminNotificationsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const isSyncingFromUrlRef = useRef(false);
  const [query, setQuery] = useState(searchQuery);
  const [selectedType, setSelectedType] = useState<AdminNotificationTypeFilter>(typeFilter);
  const [selectedDate, setSelectedDate] = useState(dateFilter);
  const deferredQuery = useDeferredValue(query);
  const groupedNotifications = groupNotificationsByDate(notifications);
  const selectedDateLabel = formatSelectedDateLabel(dateFilter);
  const hasSearch = searchQuery.trim().length > 0;
  const hasActiveFilters = hasSearch || typeFilter !== "all" || dateFilter.length > 0;

  useEffect(() => {
    const params = new URLSearchParams(searchParamsKey);
    const nextQuery = params.get("q")?.trim() ?? "";
    const nextType = parseNotificationTypeFromUrl(params.get("type"));
    const nextDate = params.get("date") ?? "";
    const shouldSync = query !== nextQuery || selectedType !== nextType || selectedDate !== nextDate;

    if (shouldSync) {
      isSyncingFromUrlRef.current = true;
    }

    if (query !== nextQuery) {
      setQuery(nextQuery);
    }

    if (selectedType !== nextType) {
      setSelectedType(nextType);
    }

    if (selectedDate !== nextDate) {
      setSelectedDate(nextDate);
    }
  }, [searchParamsKey]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsKey);
    const nextQuery = params.get("q")?.trim() ?? "";
    const nextType = parseNotificationTypeFromUrl(params.get("type"));
    const nextDate = params.get("date") ?? "";

    if (query === nextQuery && selectedType === nextType && selectedDate === nextDate) {
      isSyncingFromUrlRef.current = false;
    }
  }, [query, searchParamsKey, selectedDate, selectedType]);

  useEffect(() => {
    if (isSyncingFromUrlRef.current) {
      return;
    }

    const nextHref = buildNotificationsHref({
      page: 1,
      filter,
      searchQuery: deferredQuery,
      typeFilter: selectedType,
      dateFilter: selectedDate,
    });
    const nextQuery = getNotificationsFilterQuery({
      filter,
      searchQuery: deferredQuery,
      typeFilter: selectedType,
      dateFilter: selectedDate,
    });
    const currentParams = new URLSearchParams(searchParamsKey);
    currentParams.delete("page");
    const currentQuery = currentParams.toString();

    if (nextQuery !== currentQuery) {
      startTransition(() => {
        router.replace(nextHref, { scroll: false });
      });
    }
  }, [deferredQuery, filter, router, searchParamsKey, selectedDate, selectedType]);

  const previousPageHref = buildNotificationsHref({
    page: currentPage - 1,
    filter,
    searchQuery,
    typeFilter,
    dateFilter,
  });
  const nextPageHref = buildNotificationsHref({
    page: currentPage + 1,
    filter,
    searchQuery,
    typeFilter,
    dateFilter,
  });

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
          
        </div>

        <section className="mt-8 rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={buildNotificationsHref({ page: 1, filter: "all", searchQuery, typeFilter, dateFilter })}>
                <TabButton active={filter === "all"} count={allCount} label="ทั้งหมด" />
              </Link>
              <Link href={buildNotificationsHref({ page: 1, filter: "unread", searchQuery, typeFilter, dateFilter })}>
                <TabButton active={filter === "unread"} count={unreadCount} label="ยังไม่อ่าน" />
              </Link>
            </div>

            {unreadCount > 0 ? (
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

                  <AppSelect
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value as AdminNotificationTypeFilter)}
                    options={NOTIFICATION_TYPE_OPTIONS}
                    tone="admin"
                    size="md"
                    surface="muted"
                    wrapperClassName="min-w-42"
                    className="font-medium"
                  />

                  {hasActiveFilters ? (
                    <Link
                      href={buildNotificationsHref({
                        page: 1,
                        filter,
                        searchQuery: "",
                        typeFilter: "all",
                        dateFilter: "",
                      })}
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      ล้าง
                    </Link>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                    {filter === "all" ? "ทั้งหมด" : "ยังไม่อ่าน"} {totalCount.toLocaleString("th-TH")}
                  </span>
                  {hasSearch ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                      ค้นหา {searchQuery}
                    </span>
                  ) : null}
                  {typeFilter !== "all" ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                      {NOTIFICATION_TYPE_OPTIONS.find((option) => option.value === typeFilter)?.label}
                    </span>
                  ) : null}
                  {selectedDateLabel ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                      วันที่ {selectedDateLabel}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                    หน้า {currentPage.toLocaleString("th-TH")} / {totalPages.toLocaleString("th-TH")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {totalCount === 0 ? (
            <div className="flex min-h-105 flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-admin/8 text-(--color-admin)">
                <EmptyIcon />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">
                {hasActiveFilters
                  ? "ไม่พบการแจ้งเตือนที่ตรงกับเงื่อนไข"
                  : filter === "all"
                    ? "ยังไม่มีการแจ้งเตือน"
                    : "ไม่มีรายการที่ยังไม่อ่าน"}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {hasActiveFilters
                  ? "ไม่พบการแจ้งเตือนที่ตรงกับคำค้นหานี้ ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองแล้วค้นหาใหม่"
                  : filter === "all"
                    ? "เมื่อมีการส่งหรืออัปเดตแบบฟอร์มของนักศึกษา รายการจะแสดงที่นี่โดยอัตโนมัติ"
                    : "รายการที่ยังไม่อ่านจะกลับมาแสดงที่นี่เมื่อมีการแจ้งเตือนใหม่เข้ามา"}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 border-b border-slate-200/80 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:px-6">
                <BellIcon />
                <span>คลิกที่รายการเพื่ออ่านและเปิดหน้าที่เกี่ยวข้อง</span>
              </div>
              <div className="max-h-[calc(100vh-19rem)] overflow-y-auto px-5 sm:px-6">
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
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 sm:px-6">
                {currentPage > 1 ? (
                  <Link
                    href={previousPageHref}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <ChevronLeftIcon />
                    Previous
                  </Link>
                ) : <span className="inline-flex px-4 py-2 text-sm text-slate-300">Previous</span>}

                <p className="text-sm font-medium text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>

                {currentPage < totalPages ? (
                  <Link
                    href={nextPageHref}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Next
                    <ChevronRightIcon />
                  </Link>
                ) : <span className="inline-flex px-4 py-2 text-sm text-slate-300">Next</span>}
              </div>
            </div>
          )}
        </section>
      </main>
    </AdminLayoutShell>
  );
}