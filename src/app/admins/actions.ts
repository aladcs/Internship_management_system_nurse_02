"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type UserRole } from "@prisma/client";
import {
  type DeleteAdminActionState,
  type ResetAdminPasswordActionState,
  type SaveAdminActionState,
} from "@/app/admins/action-state";
import { clearSession, readSession } from "@/lib/auth/session";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { generatePassword, hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/security/rate-limit";

const CREATE_ADMIN_RATE_LIMIT_WINDOW_MS = 1000 * 60 * 10;
const CREATE_ADMIN_RATE_LIMIT_PER_ACTOR = 5;

function normalizeName(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function toAdminListItem(admin: {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
}) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    createdAt: admin.createdAt.toISOString(),
  };
}

async function requireSuperAdminSession() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== ("super_admin" satisfies UserRole)) {
    redirect(getRoleRedirectPath(session.role));
  }

  return session;
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function saveAdminAction(
  _previousState: SaveAdminActionState,
  formData: FormData,
): Promise<SaveAdminActionState> {
  const session = await requireSuperAdminSession();
  const intent = String(formData.get("intent") ?? "create");
  const adminId = String(formData.get("adminId") ?? "").trim();
  const name = normalizeName(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const fieldErrors: SaveAdminActionState["fieldErrors"] = {};

  if (!email) {
    fieldErrors.email = "กรุณากรอกอีเมลผู้ดูแลระบบ";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "กรุณากรอกอีเมลให้ถูกต้อง";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "validation-error",
      message: null,
      fieldErrors,
      values: { name, email },
      admin: null,
      generatedPassword: null,
    };
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingByEmail && (intent !== "edit" || existingByEmail.id !== adminId)) {
    return {
      status: "validation-error",
      message: null,
      fieldErrors: {
        email: "มีบัญชีที่ใช้อีเมลนี้อยู่แล้ว",
      },
      values: { name, email },
      admin: null,
      generatedPassword: null,
    };
  }

  if (intent === "edit") {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        id: adminId,
        role: "admin",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!existingAdmin) {
      return {
        status: "error",
        message: "ไม่พบบัญชีผู้ดูแลระบบที่เลือก",
        fieldErrors: {},
        values: { name, email },
        admin: null,
        generatedPassword: null,
      };
    }

    const updatedAdmin = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    revalidatePath("/admins");

    return {
      status: "updated",
      message: "อัปเดตข้อมูลผู้ดูแลระบบเรียบร้อยแล้ว",
      fieldErrors: {},
      values: { name: updatedAdmin.name ?? "", email: updatedAdmin.email },
      admin: toAdminListItem(updatedAdmin),
      generatedPassword: null,
    };
  }

  const createAdminLimit = consumeRateLimit({
    bucket: "create-admin:actor",
    key: session.userId,
    limit: CREATE_ADMIN_RATE_LIMIT_PER_ACTOR,
    windowMs: CREATE_ADMIN_RATE_LIMIT_WINDOW_MS,
  });

  if (!createAdminLimit.allowed) {
    return {
      status: "error",
      message: "สร้างบัญชีผู้ดูแลระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง",
      fieldErrors: {},
      values: { name, email },
      admin: null,
      generatedPassword: null,
    };
  }

  const generatedPassword = generatePassword();
  const createdAdmin = await prisma.user.create({
    data: {
      email,
      name,
      role: "admin",
      createdById: session.userId,
      passwordHash: await hashPassword(generatedPassword),
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  revalidatePath("/admins");

  return {
    status: "created",
    message: "สร้างบัญชีผู้ดูแลระบบเรียบร้อยแล้ว",
    fieldErrors: {},
    values: {
      name: createdAdmin.name ?? "",
      email: createdAdmin.email,
    },
    admin: toAdminListItem(createdAdmin),
    generatedPassword,
  };
}

export async function deleteAdminAction(
  _previousState: DeleteAdminActionState,
  formData: FormData,
): Promise<DeleteAdminActionState> {
  await requireSuperAdminSession();
  const adminId = String(formData.get("adminId") ?? "").trim();

  if (!adminId) {
    return {
      status: "error",
      message: "ไม่พบบัญชีผู้ดูแลระบบที่เลือก",
      deletedAdminId: null,
    };
  }

  const existingAdmin = await prisma.user.findFirst({
    where: {
      id: adminId,
      role: "admin",
    },
    select: { id: true },
  });

  if (!existingAdmin) {
    return {
      status: "error",
      message: "ไม่พบบัญชีผู้ดูแลระบบที่เลือก",
      deletedAdminId: null,
    };
  }

  await prisma.user.delete({
    where: { id: existingAdmin.id },
  });

  revalidatePath("/admins");

  return {
    status: "deleted",
    message: "ลบบัญชีผู้ดูแลระบบเรียบร้อยแล้ว",
    deletedAdminId: existingAdmin.id,
  };
}

export async function resetAdminPasswordAction(
  _previousState: ResetAdminPasswordActionState,
  formData: FormData,
): Promise<ResetAdminPasswordActionState> {
  await requireSuperAdminSession();
  const adminId = String(formData.get("adminId") ?? "").trim();

  if (!adminId) {
    return {
      status: "error",
      message: "ไม่พบบัญชีผู้ดูแลระบบที่เลือก",
      admin: null,
      generatedPassword: null,
    };
  }

  const existingAdmin = await prisma.user.findFirst({
    where: {
      id: adminId,
      role: "admin",
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!existingAdmin) {
    return {
      status: "error",
      message: "ไม่พบบัญชีผู้ดูแลระบบที่เลือก",
      admin: null,
      generatedPassword: null,
    };
  }

  const generatedPassword = generatePassword();

  await prisma.user.update({
    where: {
      id: existingAdmin.id,
    },
    data: {
      passwordHash: await hashPassword(generatedPassword),
    },
  });

  revalidatePath("/admins");

  return {
    status: "success",
    message: "รีเซ็ตรหัสผ่านผู้ดูแลระบบเรียบร้อยแล้ว",
    admin: toAdminListItem(existingAdmin),
    generatedPassword,
  };
}
