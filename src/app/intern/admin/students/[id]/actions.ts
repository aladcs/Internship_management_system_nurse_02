"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type InternshipStatus, type UserRole } from "@prisma/client";
import {
  initialUpdateStudentStatusActionState,
  type UpdateStudentStatusActionState,
} from "@/app/intern/admin/students/[id]/action-state";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

const NEXT_STATUS_BY_CURRENT: Partial<Record<InternshipStatus, InternshipStatus>> = {
  pending: "in_progress",
  in_progress: "completed",
};

async function requireAdminSession() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== ("admin" satisfies UserRole)) {
    redirect(getRoleRedirectPath(session.role));
  }

  return session;
}

export async function updateStudentStatusAction(
  _previousState: UpdateStudentStatusActionState,
  formData: FormData,
): Promise<UpdateStudentStatusActionState> {
  await requireAdminSession();

  const studentId = String(formData.get("studentId") ?? "").trim();

  if (!studentId) {
    return {
      ...initialUpdateStudentStatusActionState,
      status: "error",
      message: "ไม่พบข้อมูลนักศึกษาที่เลือก",
    };
  }

  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      internshipStatus: true,
      userId: true,
    },
  });

  if (!student) {
    return {
      ...initialUpdateStudentStatusActionState,
      status: "error",
      message: "ไม่พบข้อมูลนักศึกษาที่เลือก",
    };
  }

  const nextStatus = NEXT_STATUS_BY_CURRENT[student.internshipStatus];

  if (!nextStatus) {
    return {
      ...initialUpdateStudentStatusActionState,
      status: "error",
      message: "ข้อมูลฝึกงานนี้เสร็จสมบูรณ์แล้ว",
      updatedStatus: student.internshipStatus,
    };
  }

  const updatedStudent = await prisma.student.update({
    where: {
      id: student.id,
    },
    data: {
      internshipStatus: nextStatus,
    },
    select: {
      internshipStatus: true,
    },
  });

  revalidatePath("/intern/admin/students");
  revalidatePath(`/intern/admin/students/${student.id}`);
  revalidatePath("/intern/overview");
  revalidatePath("/intern/form");

  return {
    status: "success",
    message:
      updatedStudent.internshipStatus === "completed"
        ? "อัปเดตสถานะการฝึกงานของนักศึกษาเป็นเสร็จสิ้นแล้ว"
        : "อัปเดตสถานะการฝึกงานของนักศึกษาเป็นกำลังดำเนินการแล้ว",
    updatedStatus: updatedStudent.internshipStatus,
  };
}