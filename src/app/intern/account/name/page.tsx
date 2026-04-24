import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChangeDisplayNameForm } from "@/components/auth/change-display-name-form";
import { getAuthenticatedRedirectPath } from "@/lib/auth/roles";
import { readSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "ตั้งชื่อที่แสดง | ระบบจัดการฝึกงาน",
  description: "หน้าสำหรับตั้งค่าชื่อที่แสดงของบัญชีผู้ใช้งานในระบบจัดการฝึกงาน",
};

export default async function InternAccountNamePage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "student") {
    redirect(getAuthenticatedRedirectPath(session));
  }

  return (
    <ChangeDisplayNameForm
      backHref={getAuthenticatedRedirectPath(session)}
      currentUser={{
        email: session.email,
        name: session.name,
        roleLabel: session.role === "super_admin" ? "ซูเปอร์แอดมิน" : "ผู้ดูแล",
      }}
      theme="admin"
    />
  );
}