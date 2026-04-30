import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminActivityLogPage } from "@/components/admin/admin-activity-log-page";
import { getAdminActivityLogPageData } from "@/lib/admin/activity-logs";
import type { ActivityCategoryFilter, ActivityRoleFilter } from "@/lib/admin/activity-log-shared";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Activity Log | ระบบจัดการฝึกงาน",
  description: "รายการกิจกรรมทั้งหมดสำหรับผู้ดูแลระบบ พร้อมเวลาอัปเดตล่าสุดและผู้ที่ดำเนินการ",
};

const PAGE_SIZE = 10;

type InternActivityLogsPageProps = {
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

function normalizeOptionalSearch(value: string | null) {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

function parseRoleFilter(value: string | null): ActivityRoleFilter {
  return value === "admin" || value === "student" ? value : "all";
}

function parseCategoryFilter(value: string | null): ActivityCategoryFilter {
  return value === "submission" || value === "edit" || value === "file" || value === "status" || value === "other"
    ? value
    : "all";
}

function parseDateFilter(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(parsedDate.getTime()) ? null : value;
}

export default async function InternActivityLogsPage({ searchParams }: InternActivityLogsPageProps) {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = parsePageNumber(readSearchParam(resolvedSearchParams, "page"));
  const query = normalizeOptionalSearch(readSearchParam(resolvedSearchParams, "q"));
  const role = parseRoleFilter(readSearchParam(resolvedSearchParams, "role"));
  const category = parseCategoryFilter(readSearchParam(resolvedSearchParams, "category"));
  const date = parseDateFilter(readSearchParam(resolvedSearchParams, "date"));

  const activityLogPageData = await getAdminActivityLogPageData({
    currentPage,
    pageSize: PAGE_SIZE,
    query,
    role,
    category,
    date,
  });

  return (
    <AdminActivityLogPage
      currentUser={{
        email: session.email,
        name: session.name,
      }}
      activityLogs={activityLogPageData.activityLogs}
      currentPage={activityLogPageData.currentPage}
      totalCount={activityLogPageData.totalCount}
      totalPages={activityLogPageData.totalPages}
      filters={activityLogPageData.filters}
      summary={activityLogPageData.summary}
    />
  );
}