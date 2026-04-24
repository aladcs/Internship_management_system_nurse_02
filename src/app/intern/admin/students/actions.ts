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

function normalizeName(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function splitStudentName(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? null,
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

function toStudentListItem(student: {
  id: string;
  internshipStatus: StudentListItem["status"];
  major: string | null;
  user: {
    email: string;
    name: string | null;
  };
}) {
  return {
    id: student.id,
    email: student.user.email,
    major: student.major,
    name: student.user.name?.trim() || student.user.email,
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
  const intent = String(formData.get("intent") ?? "create");
  const studentId = String(formData.get("studentId") ?? "").trim();
  const name = normalizeName(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const fieldErrors: SaveStudentActionState["fieldErrors"] = {};

  if (!name) {
    fieldErrors.name = "กรุณากรอกชื่อนักศึกษา";
  }

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
      values: { name, email },
      student: null,
      generatedPassword: null,
    };
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingByEmail && (intent !== "edit" || existingByEmail.id !== studentId)) {
    return {
      status: "validation-error",
      message: null,
      fieldErrors: {
        email: "มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว",
      },
      values: { name, email },
      student: null,
      generatedPassword: null,
    };
  }

  if (intent === "edit") {
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        user: {
          role: "student",
        },
      },
      select: {
        id: true,
        userId: true,
        internshipStatus: true,
        major: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!existingStudent) {
      return {
        status: "error",
        message: "ไม่พบนักศึกษาที่เลือก",
        fieldErrors: {},
        values: { name, email },
        student: null,
        generatedPassword: null,
      };
    }

    const { firstName, lastName } = splitStudentName(name);

    const updatedStudent = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: existingStudent.userId },
        data: {
          name,
          email,
        },
      });

      return tx.student.update({
        where: { id: existingStudent.id },
        data: {
          firstName,
          lastName,
        },
        select: {
          id: true,
          internshipStatus: true,
          major: true,
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
    revalidatePath(`/intern/admin/students/${updatedStudent.id}`);
    revalidatePath("/intern/overview");
    revalidatePath("/intern/form");

    return {
      status: "updated",
      message: "อัปเดตข้อมูลนักศึกษาเรียบร้อยแล้ว",
      fieldErrors: {},
      values: {
        name: updatedStudent.user.name?.trim() || "",
        email: updatedStudent.user.email,
      },
      student: toStudentListItem(updatedStudent),
      generatedPassword: null,
    };
  }

  const generatedPassword = generatePassword();
  const passwordHash = await hashPassword(generatedPassword);
  const { firstName, lastName } = splitStudentName(name);

  const createdStudent = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name,
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
        firstName,
        lastName,
      },
      select: {
        id: true,
        internshipStatus: true,
        major: true,
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
    message: "สร้างบัญชีนักศึกษาเรียบร้อยแล้ว",
    fieldErrors: {},
    values: {
      name,
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
      major: true,
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