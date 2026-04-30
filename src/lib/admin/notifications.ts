import type { NotificationType, Prisma } from "@prisma/client";
import { formatThaiDateTime } from "@/lib/date-format";
import { sendTelegramAdminAlert } from "@/lib/admin/telegram";
import { prisma } from "@/lib/prisma";

export type AdminNotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAtIso: string;
  createdAtLabel: string;
  isRead: boolean;
  targetPath: string;
  type: string;
  entityId: string | null;
  entityType: string | null;
  studentName: string | null;
};

export type AdminNotificationSummary = {
  unreadNotificationCount: number;
  notifications: AdminNotificationItem[];
};

export type AdminNotificationsFilter = "all" | "unread";
export type AdminNotificationTypeFilter = "all" | "submission" | "resubmission" | "form_update" | "file_update";

export type AdminNotificationsPageData = {
  notifications: AdminNotificationItem[];
  unreadNotificationCount: number;
  allCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filter: AdminNotificationsFilter;
  query: string;
  type: AdminNotificationTypeFilter;
  date: string;
};

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

function getStudentDisplayName(student: {
  firstName: string | null;
  lastName: string | null;
  user: {
    name: string | null;
    email: string;
  };
} | null) {
  if (!student) {
    return null;
  }

  const profileName = [student.firstName, student.lastName].filter(Boolean).join(" ").trim();

  return student.user.name?.trim() || profileName || student.user.email;
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

  return formatThaiDateTime(value);
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
    return `/admin/students/${notification.entityId}`;
  }

  return "/admin/students";
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
    student: {
      firstName: string | null;
      lastName: string | null;
      user: {
        name: string | null;
        email: string;
      };
    } | null;
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
    createdAtIso: notification.createdAt.toISOString(),
    createdAtLabel: getRelativeTimeLabel(notification.createdAt, now),
    isRead: notification.receipts[0]?.isRead ?? true,
    targetPath: resolveNotificationTargetPath(notification),
    entityId: notification.entityId,
    entityType: notification.entityType,
    studentName: getStudentDisplayName(notification.student),
  };
}

function getNotificationTypeCondition(type: AdminNotificationTypeFilter): Prisma.NotificationEventWhereInput {
  if (type === "submission") {
    return {
      type: {
        in: ["form_submitted"],
      },
    };
  }

  if (type === "resubmission") {
    return {
      type: {
        in: ["form_resubmitted"],
      },
    };
  }

  if (type === "form_update") {
    return {
      type: {
        in: ["form_updated", "form_updated_in_progress"],
      },
    };
  }

  if (type === "file_update") {
    return {
      type: {
        in: ["file_changed_in_progress"],
      },
    };
  }

  return {};
}

function buildAdminNotificationWhere(adminUserId: string, options?: {
  filter?: AdminNotificationsFilter;
  query?: string | null;
  type?: AdminNotificationTypeFilter;
  date?: string | null;
}): Prisma.NotificationEventWhereInput {
  const filter = options?.filter ?? "all";
  const query = options?.query?.trim() ?? "";
  const type = options?.type ?? "all";
  const date = options?.date?.trim() ?? "";
  const andConditions: Prisma.NotificationEventWhereInput[] = [
    {
      receipts: {
        some: {
          adminUserId,
          ...(filter === "unread" ? { isRead: false } : {}),
        },
      },
    },
  ];

  const typeCondition = getNotificationTypeCondition(type);

  if (Object.keys(typeCondition).length > 0) {
    andConditions.push(typeCondition);
  }

  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    andConditions.push({
      createdAt: {
        gte: start,
        lt: end,
      },
    });
  }

  if (query) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          message: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          student: {
            is: {
              OR: [
                {
                  firstName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  user: {
                    is: {
                      email: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                  },
                },
                {
                  user: {
                    is: {
                      name: {
                        contains: query,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });
  }

  return andConditions.length > 0 ? { AND: andConditions } : {};
}

async function getAdminNotifications(adminUserId: string, options?: {
  take?: number;
  skip?: number;
  filter?: AdminNotificationsFilter;
  query?: string | null;
  type?: AdminNotificationTypeFilter;
  date?: string | null;
}) {
  const now = new Date();

  const notifications = await prisma.notificationEvent.findMany({
    where: buildAdminNotificationWhere(adminUserId, options),
    orderBy: {
      createdAt: "desc",
    },
    skip: options?.skip,
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
      student: {
        select: {
          firstName: true,
          lastName: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
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

export async function getAdminNotificationsPageData(input: {
  adminUserId: string;
  currentPage: number;
  pageSize: number;
  filter: AdminNotificationsFilter;
  query?: string | null;
  type?: AdminNotificationTypeFilter;
  date?: string | null;
}): Promise<AdminNotificationsPageData> {
  const normalizedQuery = input.query?.trim() ?? "";
  const normalizedDate = input.date?.trim() ?? "";
  const currentType = input.type ?? "all";
  const [unreadNotificationCount, allCount, totalCount] = await Promise.all([
    prisma.notificationEvent.count({
      where: buildAdminNotificationWhere(input.adminUserId, {
        filter: "unread",
        query: normalizedQuery,
        type: currentType,
        date: normalizedDate,
      }),
    }),
    prisma.notificationEvent.count({
      where: buildAdminNotificationWhere(input.adminUserId, {
        filter: "all",
        query: normalizedQuery,
        type: currentType,
        date: normalizedDate,
      }),
    }),
    prisma.notificationEvent.count({
      where: buildAdminNotificationWhere(input.adminUserId, {
        filter: input.filter,
        query: normalizedQuery,
        type: currentType,
        date: normalizedDate,
      }),
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / input.pageSize));
  const effectivePage = Math.min(input.currentPage, totalPages);
  const notifications = await getAdminNotifications(input.adminUserId, {
    filter: input.filter,
    query: normalizedQuery,
    type: currentType,
    date: normalizedDate,
    skip: (effectivePage - 1) * input.pageSize,
    take: input.pageSize,
  });

  return {
    notifications,
    unreadNotificationCount,
    allCount,
    totalCount,
    currentPage: effectivePage,
    totalPages,
    filter: input.filter,
    query: normalizedQuery,
    type: currentType,
    date: normalizedDate,
  };
}