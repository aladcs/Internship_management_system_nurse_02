import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import type { StudentListItem } from "@/app/intern/admin/students/action-state";
import { StudentListPage } from "@/components/admin/student-list-page";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "รายชื่อนักศึกษา | ระบบจัดการฝึกงาน",
  description: "พื้นที่ของผู้ดูแลสำหรับดูและกรองข้อมูลการฝึกงานของนักศึกษา",
};

const EMPTY_STUDENT_NAME = "Name and surname not yet entered";
const PAGE_SIZE = 10;

type StudentStatusFilter = "all" | Exclude<StudentListItem["status"], "draft">;

type InternAdminStudentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return typeof value === "string" ? value : null;
}

function parsePageNumber(value: string | null) {
  if (!value) {
    return 1;
  }

  const pageNumber = Number.parseInt(value, 10);

  return Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
}

function parseStatusFilter(value: string | null): StudentStatusFilter {
  if (
    value === "pending" ||
    value === "needs_fix" ||
    value === "in_progress" ||
    value === "completed"
  ) {
    return value;
  }

  return "all";
}

function normalizeOptionalFilter(value: string | null) {
  const normalizedValue = value?.trim() ?? "";

  return normalizedValue ? normalizedValue : null;
}

function parseStartDateFilter(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return value;
}

function buildStudentListWhere({
  faculty,
  search,
  startDate,
  status,
}: {
  faculty: string | null;
  search: string | null;
  startDate: string | null;
  status?: StudentStatusFilter;
}): Prisma.StudentWhereInput {
  const andConditions: Prisma.StudentWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          major: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            is: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          user: {
            is: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  if (faculty) {
    andConditions.push({
      faculty: {
        equals: faculty,
        mode: "insensitive",
      },
    });
  }

  if (startDate) {
    const rangeStart = new Date(`${startDate}T00:00:00.000Z`);
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

    andConditions.push({
      internshipRecord: {
        is: {
          startDate: {
            gte: rangeStart,
            lt: rangeEnd,
          },
        },
      },
    });
  }

  if (status && status !== "all") {
    andConditions.push({
      internshipStatus: status,
    });
  }

  return andConditions.length > 0 ? { AND: andConditions } : {};
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
  const accountName = student.user.name?.trim() ?? "";

  if (profileName) {
    return {
      hasDisplayName: true,
      name: profileName,
    };
  }

  if (accountName && accountName.toLowerCase() !== student.user.email.toLowerCase()) {
    return {
      hasDisplayName: true,
      name: accountName,
    };
  }

  return {
    hasDisplayName: false,
    name: EMPTY_STUDENT_NAME,
  };
}

function toStudentListItem(student: {
  id: string;
  internshipStatus: StudentListItem["status"];
  firstName: string | null;
  lastName: string | null;
  major: string | null;
  user: {
    email: string;
    name: string | null;
  };
}): StudentListItem {
  const displayName = getStudentDisplayName(student);

  return {
    id: student.id,
    email: student.user.email,
    hasDisplayName: displayName.hasDisplayName,
    major: student.major,
    name: displayName.name,
    status: student.internshipStatus,
  };
}

export default async function InternAdminStudentsPage({
  searchParams,
}: InternAdminStudentsPageProps) {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const searchQuery = normalizeOptionalFilter(readSearchParam(resolvedSearchParams, "q"));
  const statusFilter = parseStatusFilter(readSearchParam(resolvedSearchParams, "status"));
  const facultyFilter = normalizeOptionalFilter(readSearchParam(resolvedSearchParams, "faculty"));
  const startDateFilter = parseStartDateFilter(readSearchParam(resolvedSearchParams, "startDate"));
  const requestedPage = parsePageNumber(readSearchParam(resolvedSearchParams, "page"));

  const baseWhere = buildStudentListWhere({
    faculty: facultyFilter,
    search: searchQuery,
    startDate: startDateFilter,
  });
  const filteredWhere = buildStudentListWhere({
    faculty: facultyFilter,
    search: searchQuery,
    startDate: startDateFilter,
    status: statusFilter,
  });

  const [
    totalStudents,
    baseFilteredCount,
    filteredStudentCount,
    pendingCount,
    needsFixCount,
    inProgressCount,
    completedCount,
    facultyRows,
  ] = await prisma.$transaction([
    prisma.student.count(),
    prisma.student.count({ where: baseWhere }),
    prisma.student.count({ where: filteredWhere }),
    prisma.student.count({
      where: {
        ...baseWhere,
        internshipStatus: "pending",
      },
    }),
    prisma.student.count({
      where: {
        ...baseWhere,
        internshipStatus: "needs_fix",
      },
    }),
    prisma.student.count({
      where: {
        ...baseWhere,
        internshipStatus: "in_progress",
      },
    }),
    prisma.student.count({
      where: {
        ...baseWhere,
        internshipStatus: "completed",
      },
    }),
    prisma.student.findMany({
      where: {
        faculty: {
          not: null,
        },
      },
      distinct: ["faculty"],
      orderBy: {
        faculty: "asc",
      },
      select: {
        faculty: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredStudentCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const students = await prisma.student.findMany({
    where: filteredWhere,
    orderBy: {
      createdAt: "desc",
    },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      internshipStatus: true,
      firstName: true,
      lastName: true,
      major: true,
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  const facultyOptions = facultyRows
    .map((row) => row.faculty?.trim() ?? "")
    .filter(Boolean);

  return (
    <StudentListPage
      key={`${currentPage}:${statusFilter}:${facultyFilter ?? ""}:${startDateFilter ?? ""}:${searchQuery ?? ""}`}
      currentUser={{
        email: session.email,
        name: session.name,
      }}
      currentPage={currentPage}
      facultyFilter={facultyFilter ?? ""}
      facultyOptions={facultyOptions}
      hasAnyStudents={totalStudents > 0}
      searchQuery={searchQuery ?? ""}
      startDateFilter={startDateFilter ?? ""}
      statusCounts={{
        all: baseFilteredCount,
        completed: completedCount,
        in_progress: inProgressCount,
        needs_fix: needsFixCount,
        pending: pendingCount,
      }}
      statusFilter={statusFilter}
      students={students.map(toStudentListItem)}
      totalCount={filteredStudentCount}
      totalPages={totalPages}
    />
  );
}