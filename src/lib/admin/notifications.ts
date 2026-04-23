import { prisma } from "@/lib/prisma";

export type AdminNotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAtLabel: string;
  isRead: boolean;
  targetPath: string;
};

export type AdminNotificationSummary = {
  unreadNotificationCount: number;
  notifications: AdminNotificationItem[];
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export async function getAdminNotificationSummary(adminUserId: string): Promise<AdminNotificationSummary> {
  const [recentNotifications, unreadNotificationCount] = await Promise.all([
    prisma.notificationEvent.findMany({
      where: {
        receipts: {
          some: {
            adminUserId,
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
            adminUserId,
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
        adminUserId,
        isRead: false,
      },
    }),
  ]);

  return {
    unreadNotificationCount,
    notifications: recentNotifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      createdAtLabel: formatDateTime(notification.createdAt),
      isRead: notification.receipts[0]?.isRead ?? true,
      targetPath: notification.targetPath || "/intern/admin/students",
    })),
  };
}