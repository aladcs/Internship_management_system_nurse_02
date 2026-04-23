import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboardPage, type AdminDashboardPageProps } from "@/components/admin/admin-dashboard-page";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dashboard | Internship Management System",
  description: "Admin dashboard for student counts, recent records, and notification activity.",
};

function formatStatusLabel(status: AdminDashboardPageProps["recentStudents"][number]["status"]) {
  if (status === "in_progress") {
    return "In Progress";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
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

  const [
    totalStudents,
    pendingStudents,
    inProgressStudents,
    completedStudents,
    recentStudents,
    recentNotifications,
    unreadNotificationCount,
  ] = await prisma.$transaction([
    prisma.student.count(),
    prisma.student.count({ where: { internshipStatus: "pending" } }),
    prisma.student.count({ where: { internshipStatus: "in_progress" } }),
    prisma.student.count({ where: { internshipStatus: "completed" } }),
    prisma.student.findMany({
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
    prisma.notificationEvent.findMany({
      where: {
        receipts: {
          some: {
            adminUserId: session.userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        title: true,
        message: true,
        targetPath: true,
        createdAt: true,
        receipts: {
          where: {
            adminUserId: session.userId,
          },
          select: {
            isRead: true,
          },
          take: 1,
        },
      },
    }),
    prisma.adminNotificationReceipt.count({
      where: {
        adminUserId: session.userId,
        isRead: false,
      },
    }),
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
    unreadNotificationCount,
    recentStudents: recentStudents.map((student) => ({
      id: student.id,
      name: getStudentDisplayName(student),
      email: student.user.email,
      status: student.internshipStatus,
      statusLabel: formatStatusLabel(student.internshipStatus),
      meta: student.major?.trim() || `Updated ${formatDateTime(student.updatedAt)}`,
    })),
    notifications: recentNotifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      createdAtLabel: formatDateTime(notification.createdAt),
      isRead: notification.receipts[0]?.isRead ?? true,
      targetPath: notification.targetPath || "/intern/admin/students",
    })),
  };

  return <AdminDashboardPage {...viewModel} />;
}