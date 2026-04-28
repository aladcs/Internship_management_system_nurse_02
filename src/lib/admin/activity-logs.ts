import { formatThaiDateTime } from "@/lib/date-format";
import {
  getActionCategory,
  getActionCategoryLabel,
  getActionLabel,
  type AdminActivityLogItem,
  type AdminActivityCategory,
} from "@/lib/admin/activity-log-shared";
import { prisma } from "@/lib/prisma";

export type AdminActivityLogPageData = {
  activityLogs: AdminActivityLogItem[];
  summary: {
    totalLogs: number;
    lastUpdatedLabel: string | null;
    lastUpdatedByLabel: string | null;
    lastUpdatedByEmail: string | null;
  };
};

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

function toActivityLogItem(log: {
  id: string;
  action: string;
  message: string;
  createdAt: Date;
  actor: {
    role: "student" | "admin" | "super_admin";
    email: string;
    name: string | null;
  } | null;
  student: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    user: {
      email: string;
      name: string | null;
    };
  };
}): AdminActivityLogItem {
  const actionCategory = getActionCategory(log.action);

  return {
    id: log.id,
    action: log.action,
    actionLabel: getActionLabel(log.action),
    actionCategory,
    actionCategoryLabel: getActionCategoryLabel(actionCategory),
    message: log.message,
    createdAtIso: log.createdAt.toISOString(),
    createdAtLabel: formatThaiDateTime(log.createdAt, "-"),
    relativeTimeLabel: getRelativeTimeLabel(log.createdAt),
    actorLabel: log.actor?.name?.trim() || log.actor?.email || "ระบบ",
    actorEmail: log.actor?.email ?? null,
    actorRole: log.actor?.role ?? null,
    studentId: log.student.id,
    studentLabel: getStudentDisplayName(log.student),
    studentEmail: log.student.user.email,
    targetPath: `/intern/admin/students/${log.student.id}`,
  };
}

export async function getAdminActivityLogPageData(): Promise<AdminActivityLogPageData> {
  const activityLogs = await prisma.activityLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      action: true,
      message: true,
      createdAt: true,
      actor: {
        select: {
          role: true,
          email: true,
          name: true,
        },
      },
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const items = activityLogs.map(toActivityLogItem);
  const latestActivity = items[0] ?? null;

  return {
    activityLogs: items,
    summary: {
      totalLogs: items.length,
      lastUpdatedLabel: latestActivity?.createdAtLabel ?? null,
      lastUpdatedByLabel: latestActivity?.actorLabel ?? null,
      lastUpdatedByEmail: latestActivity?.actorEmail ?? null,
    },
  };
}
