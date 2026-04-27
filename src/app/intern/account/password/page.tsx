import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { getAuthenticatedRedirectPath } from "@/lib/auth/roles";
import { readSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "เปลี่ยนรหัสผ่าน | ระบบจัดการฝึกงาน",
  description: "หน้าสำหรับเปลี่ยนรหัสผ่านของบัญชีผู้ใช้งานในระบบจัดการฝึกงาน",
};

export default async function InternAccountPasswordPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  const isStudent = session.role === "student";

  return (
    <ChangePasswordForm
      backHref={getAuthenticatedRedirectPath(session)}
      currentUser={{
        email: session.email,
        name: session.name,
        roleLabel: isStudent ? "นักศึกษา" : session.role === "super_admin" ? "ผู้ดูแลระบบสูงสุด" : "ผู้ดูแล",
      }}
      theme={isStudent ? "student" : "admin"}
    />
  );
}