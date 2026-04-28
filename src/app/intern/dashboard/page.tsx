import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboardPage, type AdminDashboardPageProps } from "@/components/admin/admin-dashboard-page";
import { getAdminNotificationSummary } from "@/lib/admin/notifications";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { formatInternshipStatusLabel } from "@/lib/internship-status";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "แดชบอร์ด | ระบบจัดการฝึกงาน",
  description: "แดชบอร์ดสำหรับผู้ดูแลเพื่อตรวจสอบจำนวนนักศึกษา รายการล่าสุด และการแจ้งเตือน",
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function getStudentDisplayName(student: {
  firstName: string | null;
  lastName: string | null;
  user: {
    name: string | null;
    email: string;
  };
}) {
  const profileName = [student.firstName, student.lastName].filter(Boolean).join(" ").trim();

  return student.user.name?.trim() || profileName || student.user.email;
}

export default async function InternDashboardPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  const submittedStudentWhere = {
    submittedAt: {
      not: null,
    },
  } as const;

  const [totalStudents, pendingStudents, inProgressStudents, completedStudents, recentStudents, notificationSummary] =
    await Promise.all([
      prisma.student.count({ where: submittedStudentWhere }),
      prisma.student.count({ where: { ...submittedStudentWhere, internshipStatus: "pending" } }),
      prisma.student.count({ where: { ...submittedStudentWhere, internshipStatus: "in_progress" } }),
      prisma.student.count({ where: { ...submittedStudentWhere, internshipStatus: "completed" } }),
      prisma.student.findMany({
        where: submittedStudentWhere,
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          internshipStatus: true,
          firstName: true,
          lastName: true,
          major: true,
          updatedAt: true,
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),
      getAdminNotificationSummary(session.userId),
    ]);

  const viewModel: AdminDashboardPageProps = {
    currentUser: {
      email: session.email,
      name: session.name,
    },
    stats: {
      totalStudents,
      pendingStudents,
      inProgressStudents,
      completedStudents,
    },
    recentStudents: recentStudents.map((student) => ({
      id: student.id,
      name: getStudentDisplayName(student),
      email: student.user.email,
      status: student.internshipStatus,
      statusLabel: formatInternshipStatusLabel(student.internshipStatus),
      meta: student.major?.trim() || `อัปเดต ${formatDateTime(student.updatedAt)}`,
    })),
    notifications: notificationSummary.notifications,
  };

  return <AdminDashboardPage {...viewModel} />;
}