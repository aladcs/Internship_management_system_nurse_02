"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type UserRole } from "@prisma/client";
import {
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
  const name = normalizeName(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const fieldErrors: SaveStudentActionState["fieldErrors"] = {};

  if (!name) {
    fieldErrors.name = "Enter the student name.";
  }

  if (!email) {
    fieldErrors.email = "Enter the student email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
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

  if (existingByEmail) {
    return {
      status: "validation-error",
      message: null,
      fieldErrors: {
        email: "An account with this email already exists.",
      },
      values: { name, email },
      student: null,
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
    message: "Student account created.",
    fieldErrors: {},
    values: {
      name,
      email,
    },
    student: toStudentListItem(createdStudent),
    generatedPassword,
  };
}