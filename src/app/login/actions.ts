"use server";

import { type UserRole } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { getSafePostLoginRedirectPath } from "@/lib/auth/roles";
import { createSession } from "@/lib/auth/session";
import { consumeRateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import type { LoginActionState } from "@/app/login/action-state";

const LOGIN_RATE_LIMIT_WINDOW_MS = 1000 * 60 * 10;
const LOGIN_RATE_LIMIT_PER_IP = 10;
const LOGIN_RATE_LIMIT_PER_IDENTITY = 5;

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

async function getLoginRateLimitKey(email: string) {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const realIp = requestHeaders.get("x-real-ip");
  const connectingIp = requestHeaders.get("cf-connecting-ip");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || connectingIp?.trim() || "unknown";

  return {
    ipKey: clientIp,
    identityKey: `${clientIp}:${email || "unknown"}`,
  };
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

  const rateLimitKeys = await getLoginRateLimitKey(email);
  const ipLimit = consumeRateLimit({
    bucket: "login:ip",
    key: rateLimitKeys.ipKey,
    limit: LOGIN_RATE_LIMIT_PER_IP,
    windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
  });
  const identityLimit = consumeRateLimit({
    bucket: "login:identity",
    key: rateLimitKeys.identityKey,
    limit: LOGIN_RATE_LIMIT_PER_IDENTITY,
    windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
  });

  if (!ipLimit.allowed || !identityLimit.allowed) {
    const retryAfterSeconds = Math.max(
      ipLimit.retryAfterSeconds,
      identityLimit.retryAfterSeconds,
    );
    const retryAfterMinutes = Math.max(
      1,
      Math.ceil(retryAfterSeconds / 60),
    );

    return {
      error: `พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอประมาณ ${retryAfterMinutes} นาทีแล้วลองใหม่อีกครั้ง`,
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
      studentProfile: {
        select: {
          tosAcceptedAt: true,
        },
      },
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

  resetRateLimit("login:ip", rateLimitKeys.ipKey);
  resetRateLimit("login:identity", rateLimitKeys.identityKey);

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name ?? null,
    studentHasAcceptedTos:
      user.role === ("student" satisfies UserRole)
        ? Boolean(user.studentProfile?.tosAcceptedAt)
        : undefined,
  });

  redirect(
    getSafePostLoginRedirectPath(
      {
        role: user.role as UserRole,
        studentHasAcceptedTos:
          user.role === ("student" satisfies UserRole)
            ? Boolean(user.studentProfile?.tosAcceptedAt)
            : undefined,
      },
      nextPath,
    ),
  );
}
