"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type UserRole } from "@prisma/client";
import {
  type DeleteStudentActionState,
  type ResetStudentPasswordActionState,
  type StudentListItem,
  type SaveStudentActionState,
} from "@/app/intern/admin/students/action-state";
import { clearSession } from "@/lib/auth/session";
import { readSession } from "@/lib/auth/session";
import { generatePassword, hashPassword } from "@/lib/auth/password";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

const EMPTY_STUDENT_NAME = "ยังไม่ได้กรอกชื่อ";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function getStudentDisplayName(student: {
  firstName?: string | null;
  lastName?: string | null;
  user: {
    email: string;
    name: string | null;
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
  firstName?: string | null;
  lastName?: string | null;
  major: string | null;
  submittedAt?: Date | null;
  user: {
    email: string;
    name: string | null;
  };
}) {
  const displayName = getStudentDisplayName(student);

  return {
    id: student.id,
    email: student.user.email,
    hasDisplayName: displayName.hasDisplayName,
    hasSubmittedForm: Boolean(student.submittedAt),
    major: student.major,
    name: displayName.name,
    status: student.internshipStatus,
  };
}

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

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function saveStudentAction(
  _previousState: SaveStudentActionState,
  formData: FormData,
): Promise<SaveStudentActionState> {
  const session = await requireAdminSession();
  const email = normalizeEmail(formData.get("email"));
  const fieldErrors: SaveStudentActionState["fieldErrors"] = {};

  if (!email) {
    fieldErrors.email = "กรุณากรอกอีเมลนักศึกษา";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "กรุณากรอกอีเมลให้ถูกต้อง";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "validation-error",
      message: null,
      fieldErrors,
      values: { email },
      student: null,
      generatedPassword: null,
    };
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingByEmail) {
    return {
      status: "validation-error",
      message: null,
      fieldErrors: {
        email: "มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว",
      },
      values: { email },
      student: null,
      generatedPassword: null,
    };
  }

  const generatedPassword = generatePassword();
  const passwordHash = await hashPassword(generatedPassword);

  const createdStudent = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: null,
        role: "student",
        createdById: session.userId,
        passwordHash,
      },
      select: {
        id: true,
      },
    });

    return tx.student.create({
      data: {
        userId: user.id,
      },
      select: {
        id: true,
        internshipStatus: true,
        firstName: true,
        lastName: true,
        major: true,
        submittedAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  });

  revalidatePath("/intern/admin/students");

  return {
    status: "created",
    message: "สร้างบัญชีนักศึกษาแล้ว",
    fieldErrors: {},
    values: {
      email,
    },
    student: toStudentListItem(createdStudent),
    generatedPassword,
  };
}

export async function deleteStudentAction(
  _previousState: DeleteStudentActionState,
  formData: FormData,
): Promise<DeleteStudentActionState> {
  await requireAdminSession();
  const studentId = String(formData.get("studentId") ?? "").trim();

  if (!studentId) {
    return {
      status: "error",
      message: "ไม่พบนักศึกษาที่เลือก",
      deletedStudentId: null,
    };
  }

  const existingStudent = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          role: true,
        },
      },
    },
  });

  if (!existingStudent || existingStudent.user.role !== "student") {
    return {
      status: "error",
      message: "ไม่พบนักศึกษาที่เลือก",
      deletedStudentId: null,
    };
  }

  await prisma.user.delete({
    where: {
      id: existingStudent.userId,
    },
  });

  revalidatePath("/intern/admin/students");

  return {
    status: "deleted",
    message: "ลบบัญชีนักศึกษาเรียบร้อยแล้ว",
    deletedStudentId: existingStudent.id,
  };
}

export async function resetStudentPasswordAction(
  _previousState: ResetStudentPasswordActionState,
  formData: FormData,
): Promise<ResetStudentPasswordActionState> {
  await requireAdminSession();
  const studentId = String(formData.get("studentId") ?? "").trim();

  if (!studentId) {
    return {
      status: "error",
      message: "ไม่พบนักศึกษาที่เลือก",
      student: null,
      generatedPassword: null,
    };
  }

  const existingStudent = await prisma.student.findUnique({
    where: {
      id: studentId,
    },
    select: {
      id: true,
      internshipStatus: true,
      firstName: true,
      lastName: true,
      major: true,
      submittedAt: true,
      userId: true,
      user: {
        select: {
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!existingStudent || existingStudent.user.role !== "student") {
    return {
      status: "error",
      message: "ไม่พบนักศึกษาที่เลือก",
      student: null,
      generatedPassword: null,
    };
  }

  const generatedPassword = generatePassword();

  await prisma.user.update({
    where: {
      id: existingStudent.userId,
    },
    data: {
      passwordHash: await hashPassword(generatedPassword),
    },
  });

  revalidatePath("/intern/admin/students");
  revalidatePath(`/intern/admin/students/${existingStudent.id}`);

  return {
    status: "success",
    message: "รีเซ็ตรหัสผ่านนักศึกษาเรียบร้อยแล้ว",
    student: toStudentListItem(existingStudent),
    generatedPassword,
  };
}