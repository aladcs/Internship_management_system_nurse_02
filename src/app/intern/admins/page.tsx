import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminListPage } from "@/components/admin/admin-list-page";
import type { AdminListItem } from "@/app/intern/admins/action-state";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin List | Internship Management System",
  description: "Super admin workspace for managing administrator accounts.",
};

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

export default async function InternAdminsPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "super_admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  const admins = await prisma.user.findMany({
    where: {
      role: "admin",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return (
    <AdminListPage
      admins={admins.map(toAdminListItem)}
      currentUser={{
        email: session.email,
        name: session.name,
      }}
    />
  );
}