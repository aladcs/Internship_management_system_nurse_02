import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNotificationsPage } from "@/components/admin/admin-notifications-page";
import {
  getAdminNotificationsPageData,
  type AdminNotificationsFilter,
  type AdminNotificationTypeFilter,
} from "@/lib/admin/notifications";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "การแจ้งเตือน | ระบบจัดการฝึกงาน",
  description: "รายการการแจ้งเตือนทั้งหมดสำหรับผู้ดูแลระบบ พร้อมการนำทางไปยังหน้าที่เกี่ยวข้อง",
};

const PAGE_SIZE = 10;

type InternNotificationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return typeof value === "string" ? value : null;
}

function parsePageNumber(value: string | null) {
  if (!value) {
    return 1;
  }

  const pageNumber = Number.parseInt(value, 10);

  return Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
}

function parseNotificationsFilter(value: string | null): AdminNotificationsFilter {
  return value === "unread" ? "unread" : "all";
}

function parseNotificationTypeFilter(value: string | null): AdminNotificationTypeFilter {
  return value === "submission" || value === "resubmission" || value === "form_update" || value === "file_update"
    ? value
    : "all";
}

function normalizeOptionalSearch(value: string | null) {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

function parseDateFilter(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(parsedDate.getTime()) ? null : value;
}

export default async function InternNotificationsPage({ searchParams }: InternNotificationsPageProps) {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = parsePageNumber(readSearchParam(resolvedSearchParams, "page"));
  const filter = parseNotificationsFilter(readSearchParam(resolvedSearchParams, "filter"));
  const query = normalizeOptionalSearch(readSearchParam(resolvedSearchParams, "q"));
  const type = parseNotificationTypeFilter(readSearchParam(resolvedSearchParams, "type"));
  const date = parseDateFilter(readSearchParam(resolvedSearchParams, "date"));

  const notificationPageData = await getAdminNotificationsPageData({
    adminUserId: session.userId,
    currentPage,
    pageSize: PAGE_SIZE,
    filter,
    query,
    type,
    date,
  });

  return (
    <AdminNotificationsPage
      currentUser={{
        email: session.email,
        name: session.name,
      }}
      notifications={notificationPageData.notifications}
      allCount={notificationPageData.allCount}
      unreadCount={notificationPageData.unreadNotificationCount}
      totalCount={notificationPageData.totalCount}
      currentPage={notificationPageData.currentPage}
      totalPages={notificationPageData.totalPages}
      filter={notificationPageData.filter}
      searchQuery={notificationPageData.query}
      typeFilter={notificationPageData.type}
      dateFilter={notificationPageData.date}
    />
  );
}