"use server";

import { type UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { createSession } from "@/lib/auth/session";
import type { LoginActionState } from "@/app/login/action-state";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizePassword(value: FormDataEntryValue | null) {
  return String(value ?? "");
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));

  if (!email || !password) {
    return {
      error: "Enter both email and password.",
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
      error: "Invalid email or password.",
      email,
    };
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return {
      error: "Invalid email or password.",
      email,
    };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name ?? null,
  });

  redirect(getRoleRedirectPath(user.role));
}