import type { NotificationType } from "@prisma/client";
import { sendTelegramAdminAlert } from "@/lib/admin/telegram";
import { prisma } from "@/lib/prisma";

export type AdminNotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAtLabel: string;
  isRead: boolean;
  targetPath: string;
  type: string;
  entityId: string | null;
  entityType: string | null;
};

export type AdminNotificationSummary = {
  unreadNotificationCount: number;
  notifications: AdminNotificationItem[];
};

export type AdminNotificationsFilter = "all" | "unread";

export async function createAdminNotificationEvent(input: {
  studentId: string;
  type: NotificationType;
  title: string;
  message: string;
  targetPath: string;
}) {
  const admins = await prisma.user.findMany({
    where: {
      role: "admin",
    },
    select: {
      id: true,
    },
  });

  if (admins.length === 0) {
    return;
  }

  await prisma.notificationEvent.create({
    data: {
      studentId: input.studentId,
      type: input.type,
      title: input.title,
      message: input.message,
      targetPath: input.targetPath,
      entityId: input.studentId,
      entityType: "student",
      receipts: {
        createMany: {
          data: admins.map((admin) => ({
            adminUserId: admin.id,
          })),
        },
      },
    },
  });

  await sendTelegramAdminAlert({
    title: input.title,
    message: input.message,
    targetPath: input.targetPath,
  });
}

function getRelativeTimeLabel(value: Date, now = new Date()) {
  const diffMs = now.getTime() - value.getTime();

  if (diffMs < 60_000) {
    return "เมื่อสักครู่";
  }

  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 60) {
    return `${diffMinutes} นาทีที่แล้ว`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} ชม. ที่แล้ว`;
  }

  if (diffHours < 48) {
    return "เมื่อวาน";
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays} วันที่แล้ว`;
  }

  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function resolveNotificationTargetPath(notification: {
  targetPath: string | null;
  entityType: string | null;
  entityId: string | null;
}) {
  if (notification.targetPath?.trim()) {
    return notification.targetPath;
  }

  if (notification.entityType === "student" && notification.entityId) {
    return `/intern/admin/students/${notification.entityId}`;
  }

  return "/intern/admin/students";
}

function toAdminNotificationItem(
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    targetPath: string | null;
    entityId: string | null;
    entityType: string | null;
    createdAt: Date;
    receipts: Array<{
      isRead: boolean;
    }>;
  },
  now: Date,
): AdminNotificationItem {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    createdAtLabel: getRelativeTimeLabel(notification.createdAt, now),
    isRead: notification.receipts[0]?.isRead ?? true,
    targetPath: resolveNotificationTargetPath(notification),
    entityId: notification.entityId,
    entityType: notification.entityType,
  };
}

async function getAdminNotifications(adminUserId: string, options?: { take?: number; filter?: AdminNotificationsFilter }) {
  const filter = options?.filter ?? "all";
  const now = new Date();

  const notifications = await prisma.notificationEvent.findMany({
    where: {
      receipts: {
        some: {
          adminUserId,
          ...(filter === "unread" ? { isRead: false } : {}),
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: options?.take,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      targetPath: true,
      entityId: true,
      entityType: true,
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
  });

  return notifications.map((notification) => toAdminNotificationItem(notification, now));
}

export async function getAdminNotificationSummary(adminUserId: string): Promise<AdminNotificationSummary> {
  const [recentNotifications, unreadNotificationCount] = await Promise.all([
    getAdminNotifications(adminUserId, { take: 6 }),
    prisma.adminNotificationReceipt.count({
      where: {
        adminUserId,
        isRead: false,
      },
    }),
  ]);

  return {
    unreadNotificationCount,
    notifications: recentNotifications,
  };
}

export async function getAdminNotificationsPageData(adminUserId: string) {
  const [allNotifications, unreadNotificationCount, unreadNotifications] = await Promise.all([
    getAdminNotifications(adminUserId),
    prisma.adminNotificationReceipt.count({
      where: {
        adminUserId,
        isRead: false,
      },
    }),
    getAdminNotifications(adminUserId, { filter: "unread" }),
  ]);

  return {
    unreadNotificationCount,
    allNotifications,
    unreadNotifications,
  };
}