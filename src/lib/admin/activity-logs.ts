import type { Prisma } from "@prisma/client";
import { formatThaiDateTime } from "@/lib/date-format";
import {
  getActionCategory,
  getActionCategoryLabel,
  getActionLabel,
  type AdminActivityLogItem,
  type AdminActivityCategory,
  type ActivityCategoryFilter,
  type ActivityRoleFilter,
} from "@/lib/admin/activity-log-shared";
import { prisma } from "@/lib/prisma";

export type AdminActivityLogPageData = {
  activityLogs: AdminActivityLogItem[];
  currentPage: number;
  totalCount: number;
  totalPages: number;
  filters: {
    query: string;
    role: ActivityRoleFilter;
    category: ActivityCategoryFilter;
    date: string;
  };
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

const ACTIVITY_ACTIONS_BY_CATEGORY: Record<Exclude<AdminActivityCategory, "other">, string[]> = {
  submission: ["student_submitted_form", "student_resubmitted_form"],
  edit: ["student_edited_form", "admin_edited_student_data"],
  file: ["student_uploaded_files", "student_removed_files"],
  status: ["admin_approved_form", "admin_sent_back_form", "admin_marked_completed"],
};


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
    targetPath: `/admin/students/${log.student.id}`,
  };
}

function buildActivityLogWhere(input: {
  query?: string | null;
  role?: ActivityRoleFilter;
  category?: ActivityCategoryFilter;
  date?: string | null;
}): Prisma.ActivityLogWhereInput {
  const query = input.query?.trim() ?? "";
  const where: Prisma.ActivityLogWhereInput = {};

  if (input.role === "admin") {
    where.actor = {
      is: {
        role: {
          in: ["admin", "super_admin"],
        },
      },
    };
  } else if (input.role === "student") {
    where.actor = {
      is: {
        role: "student",
      },
    };
  }

  if (input.category && input.category !== "all") {
    where.action = input.category === "other"
      ? { notIn: Object.values(ACTIVITY_ACTIONS_BY_CATEGORY).flat() }
      : { in: ACTIVITY_ACTIONS_BY_CATEGORY[input.category] };
  }

  if (input.date && /^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    const start = new Date(`${input.date}T00:00:00.000Z`);
    const end = new Date(`${input.date}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    where.createdAt = {
      gte: start,
      lt: end,
    };
  }

  if (query) {
    where.OR = [
      {
        message: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        action: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        actor: {
          is: {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
      {
        actor: {
          is: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
      {
        student: {
          is: {
            firstName: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
      {
        student: {
          is: {
            lastName: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      },
      {
        student: {
          is: {
            user: {
              is: {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      },
      {
        student: {
          is: {
            user: {
              is: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      },
    ];
  }

  return where;
}

export async function getAdminActivityLogPageData(input: {
  currentPage: number;
  pageSize: number;
  query?: string | null;
  role?: ActivityRoleFilter;
  category?: ActivityCategoryFilter;
  date?: string | null;
}): Promise<AdminActivityLogPageData> {
  const where = buildActivityLogWhere(input);
  const [totalCount, summaryTotalLogs, latestActivity] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.count(),
    prisma.activityLog.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
        actor: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / input.pageSize));
  const effectivePage = Math.min(input.currentPage, totalPages);
  const activityLogs = await prisma.activityLog.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip: (effectivePage - 1) * input.pageSize,
    take: input.pageSize,
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

  return {
    activityLogs: items,
    currentPage: effectivePage,
    totalCount,
    totalPages,
    filters: {
      query: input.query?.trim() ?? "",
      role: input.role ?? "all",
      category: input.category ?? "all",
      date: input.date?.trim() ?? "",
    },
    summary: {
      totalLogs: summaryTotalLogs,
      lastUpdatedLabel: latestActivity ? formatThaiDateTime(latestActivity.createdAt, "-") : null,
      lastUpdatedByLabel: latestActivity?.actor?.name?.trim() || latestActivity?.actor?.email || null,
      lastUpdatedByEmail: latestActivity?.actor?.email ?? null,
    },
  };
}
