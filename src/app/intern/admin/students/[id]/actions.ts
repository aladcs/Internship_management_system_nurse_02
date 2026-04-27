"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type UserRole } from "@prisma/client";
import {
  initialUpdateStudentStatusActionState,
  type UpdateStudentStatusActionState,
} from "@/app/intern/admin/students/[id]/action-state";
import { readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import {
  formatInternshipStatusLabel,
  getAdminStatusTransitionError,
} from "@/lib/internship-status";
import { prisma } from "@/lib/prisma";

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
  const requestedStatus = String(formData.get("nextStatus") ?? "").trim();

  if (!studentId) {
    return {
      ...initialUpdateStudentStatusActionState,
      status: "error",
      message: "ไม่พบข้อมูลนักศึกษาที่เลือก",
    };
  }

  if (requestedStatus !== "pending" && requestedStatus !== "in_progress" && requestedStatus !== "completed") {
    return {
      ...initialUpdateStudentStatusActionState,
      status: "error",
      message: "สถานะที่ส่งมาไม่ถูกต้อง",
    };
  }

  const student = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      internshipStatus: true,
      submittedAt: true,
    },
  });

  if (!student) {
    return {
      ...initialUpdateStudentStatusActionState,
      status: "error",
      message: "ไม่พบข้อมูลนักศึกษาที่เลือก",
    };
  }

  const transitionError = getAdminStatusTransitionError({
    currentStatus: student.internshipStatus,
    nextStatus: requestedStatus,
    submittedAt: student.submittedAt,
  });

  if (transitionError) {
    return {
      ...initialUpdateStudentStatusActionState,
      status: "error",
      message: transitionError,
      updatedStatus: student.internshipStatus,
    };
  }

  const updatedStudent = await prisma.student.update({
    where: {
      id: student.id,
    },
    data: {
      internshipStatus: requestedStatus,
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
    message: `อัปเดตสถานะการฝึกงานของนักศึกษาเป็น${formatInternshipStatusLabel(updatedStudent.internshipStatus)}แล้ว`,
    updatedStatus: updatedStudent.internshipStatus,
  };
}