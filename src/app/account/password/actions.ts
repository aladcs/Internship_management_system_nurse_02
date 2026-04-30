"use server";

import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getAuthenticatedRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth/session";
import type { ChangePasswordActionState } from "@/app/account/password/action-state";

const MIN_PASSWORD_LENGTH = 8;

function normalizePassword(value: FormDataEntryValue | null) {
  return String(value ?? "");
}

export async function changePasswordAction(
  _previousState: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  const currentPassword = normalizePassword(formData.get("currentPassword"));
  const nextPassword = normalizePassword(formData.get("newPassword"));
  const confirmPassword = normalizePassword(formData.get("confirmPassword"));

  if (!currentPassword || !nextPassword || !confirmPassword) {
    return {
      error: "กรุณากรอกรหัสผ่านให้ครบทุกช่อง",
      success: null,
    };
  }

  if (nextPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร",
      success: null,
    };
  }

  if (nextPassword !== confirmPassword) {
    return {
      error: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน",
      success: null,
    };
  }

  if (currentPassword === nextPassword) {
    return {
      error: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน",
      success: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      passwordHash: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.role !== session.role) {
    redirect(getAuthenticatedRedirectPath(session));
  }

  const passwordMatches = await verifyPassword(currentPassword, user.passwordHash);

  if (!passwordMatches) {
    return {
      error: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
      success: null,
    };
  }

  await prisma.user.update({
    where: {
      id: session.userId,
    },
    data: {
      passwordHash: await hashPassword(nextPassword),
    },
  });

  return {
    error: null,
    success: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",
  };
}