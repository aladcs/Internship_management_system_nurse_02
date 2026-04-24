"use server";

import { type UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { getSafePostLoginRedirectPath } from "@/lib/auth/roles";
import { createSession } from "@/lib/auth/session";
import type { LoginActionState } from "@/app/login/action-state";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizePassword(value: FormDataEntryValue | null) {
  return String(value ?? "");
}

function normalizeNextPath(value: FormDataEntryValue | null) {
  const nextPath = String(value ?? "").trim();

  return nextPath || null;
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));
  const nextPath = normalizeNextPath(formData.get("next"));

  if (!email || !password) {
    return {
      error: "กรุณากรอกอีเมลและรหัสผ่าน",
      email,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
      name: true,
    },
  });

  if (!user) {
    return {
      error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      email,
    };
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return {
      error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      email,
    };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name ?? null,
  });

  redirect(getSafePostLoginRedirectPath(user.role, nextPath));
}