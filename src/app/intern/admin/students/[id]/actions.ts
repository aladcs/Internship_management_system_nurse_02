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
  const session = await requireAdminSession();

  const studentId = String(formData.get("studentId") ?? "").trim();
  const requestedStatus = String(formData.get("nextStatus") ?? "").trim();
  const reviewMessage = String(formData.get("reviewMessage") ?? "").trim();

  if (!studentId) {
    return {
      ...initialUpdateStudentStatusActionState,
      status: "error",
      message: "ไม่พบข้อมูลนักศึกษาที่เลือก",
    };
  }

  if (
    requestedStatus !== "pending" &&
    requestedStatus !== "needs_fix" &&
    requestedStatus !== "in_progress" &&
    requestedStatus !== "completed"
  ) {
    return {
      ...initialUpdateStudentStatusActionState,
      status: "error",
      message: "สถานะที่ส่งมาไม่ถูกต้อง",
    };
  }

  if (requestedStatus === "needs_fix" && !reviewMessage) {
    return {
      ...initialUpdateStudentStatusActionState,
      status: "error",
      message: "กรุณาระบุเหตุผลในการส่งกลับให้แก้ไข",
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
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      firstName: true,
      lastName: true,
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

  const actorLabel = session.name?.trim() || session.email;
  const studentLabel =
    [student.firstName, student.lastName].filter(Boolean).join(" ").trim() || student.user.name?.trim() || student.user.email;

  const updatedStudent = await prisma.$transaction(async (tx) => {
    const updatedRecord = await tx.student.update({
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

    if (requestedStatus === "needs_fix") {
      await tx.reviewComment.create({
        data: {
          studentId: student.id,
          adminId: session.userId,
          message: reviewMessage,
        },
      });
    }

    await tx.activityLog.create({
      data: {
        actorId: session.userId,
        studentId: student.id,
        action:
          requestedStatus === "in_progress"
            ? "admin_approved_form"
            : requestedStatus === "needs_fix"
              ? "admin_sent_back_form"
              : "admin_marked_completed",
        message:
          requestedStatus === "in_progress"
            ? `${actorLabel} อนุมัติแบบฟอร์มของ ${studentLabel}`
            : requestedStatus === "needs_fix"
              ? `${actorLabel} ส่งแบบฟอร์มของ ${studentLabel} กลับให้แก้ไข`
              : `${actorLabel} ทำเครื่องหมายว่า ${studentLabel} ฝึกงานเสร็จสิ้นแล้ว`,
        metadata: {
          fromStatus: student.internshipStatus,
          toStatus: requestedStatus,
          reviewMessage: requestedStatus === "needs_fix" ? reviewMessage : null,
        },
      },
    });

    return updatedRecord;
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