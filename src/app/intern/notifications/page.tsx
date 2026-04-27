import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminNotificationsPage } from "@/components/admin/admin-notifications-page";
import { getAdminNotificationsPageData } from "@/lib/admin/notifications";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "การแจ้งเตือน | ระบบจัดการฝึกงาน",
  description: "รายการการแจ้งเตือนทั้งหมดสำหรับผู้ดูแลระบบ พร้อมการนำทางไปยังหน้าที่เกี่ยวข้อง",
};

export default async function InternNotificationsPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  const notificationPageData = await getAdminNotificationsPageData(session.userId);

  return (
    <AdminNotificationsPage
      currentUser={{
        email: session.email,
        name: session.name,
      }}
      allNotifications={notificationPageData.allNotifications}
      unreadNotifications={notificationPageData.unreadNotifications}
    />
  );
}