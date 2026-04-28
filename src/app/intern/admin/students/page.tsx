import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { StudentListItem } from "@/app/intern/admin/students/action-state";
import { StudentListPage } from "@/components/admin/student-list-page";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "รายชื่อนักศึกษา | ระบบจัดการฝึกงาน",
  description: "พื้นที่ของผู้ดูแลสำหรับดูและกรองข้อมูลการฝึกงานของนักศึกษา",
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
  return {
    id: student.id,
    email: student.user.email,
    major: student.major,
    name: getStudentDisplayName(student),
    status: student.internshipStatus,
  };
}

export default async function InternAdminStudentsPage() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect(getRoleRedirectPath(session.role));
  }

  const students = await prisma.student.findMany({
    where: {
      submittedAt: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
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

  return (
    <StudentListPage
      currentUser={{
        email: session.email,
        name: session.name,
      }}
      students={students.map(toStudentListItem)}
    />
  );
}