import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { AdminListPage } from "@/components/admin/admin-list-page";
import type { AdminListItem } from "@/app/intern/admins/action-state";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "รายชื่อผู้ดูแลระบบ | ระบบจัดการฝึกงาน",
  description: "พื้นที่ของ super admin สำหรับจัดการบัญชีผู้ดูแลระบบ",
};

const PAGE_SIZE = 10;

type InternAdminsPageProps = {
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

function normalizeOptionalSearch(value: string | null) {
  const normalizedValue = value?.trim() ?? "";

  return normalizedValue ? normalizedValue : null;
}

function buildAdminListWhere(searchQuery: string | null): Prisma.UserWhereInput {
  if (!searchQuery) {
    return {
      role: "admin",
    };
  }

  return {
    role: "admin",
    OR: [
      {
        email: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
    ],
  };
}

function toAdminListItem(admin: {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
}): AdminListItem {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    createdAt: admin.createdAt.toISOString(),
  };
}

export default async function InternAdminsPage({ searchParams }: InternAdminsPageProps) {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "super_admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const searchQuery = normalizeOptionalSearch(readSearchParam(resolvedSearchParams, "q"));
  const requestedPage = parsePageNumber(readSearchParam(resolvedSearchParams, "page"));
  const where = buildAdminListWhere(searchQuery);

  const [totalAdmins, filteredAdminCount] = await prisma.$transaction([
    prisma.user.count({
      where: {
        role: "admin",
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredAdminCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);

  const admins = await prisma.user.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return (
    <AdminListPage
      key={`${currentPage}:${searchQuery ?? ""}:${filteredAdminCount}`}
      admins={admins.map(toAdminListItem)}
      currentPage={currentPage}
      currentUser={{
        email: session.email,
        name: session.name,
      }}
      hasAnyAdmins={totalAdmins > 0}
      searchQuery={searchQuery ?? ""}
      totalCount={filteredAdminCount}
      totalPages={totalPages}
    />
  );
}