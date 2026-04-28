import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminActivityLogPage } from "@/components/admin/admin-activity-log-page";
import { getAdminActivityLogPageData } from "@/lib/admin/activity-logs";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Activity Log | ระบบจัดการฝึกงาน",
  description: "รายการกิจกรรมทั้งหมดสำหรับผู้ดูแลระบบ พร้อมเวลาอัปเดตล่าสุดและผู้ที่ดำเนินการ",
};

export default async function InternActivityLogsPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  const activityLogPageData = await getAdminActivityLogPageData();

  return (
    <AdminActivityLogPage
      currentUser={{
        email: session.email,
        name: session.name,
      }}
      activityLogs={activityLogPageData.activityLogs}
      summary={activityLogPageData.summary}
    />
  );
}