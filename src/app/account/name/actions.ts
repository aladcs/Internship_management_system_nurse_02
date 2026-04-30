"use server";

import { redirect } from "next/navigation";
import type { ChangeDisplayNameActionState } from "@/app/account/name/action-state";
import { getAuthenticatedRedirectPath } from "@/lib/auth/roles";
import { createSession, readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const MAX_NAME_LENGTH = 255;

function normalizeName(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function changeDisplayNameAction(
  _previousState: ChangeDisplayNameActionState,
  formData: FormData,
): Promise<ChangeDisplayNameActionState> {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role === "student") {
    redirect(getAuthenticatedRedirectPath(session));
  }

  const name = normalizeName(formData.get("name"));

  if (!name) {
    return {
      error: null,
      success: null,
      fieldErrors: {
        name: "กรุณากรอกชื่อที่ต้องการแสดง",
      },
      value: name,
    };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      error: null,
      success: null,
      fieldErrors: {
        name: "ชื่อที่แสดงต้องมีความยาวไม่เกิน 255 ตัวอักษร",
      },
      value: name,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  await prisma.user.update({
    where: {
      id: session.userId,
    },
    data: {
      name,
    },
  });

  await createSession({
    userId: session.userId,
    email: session.email,
    role: session.role,
    name,
    studentHasAcceptedTos: session.studentHasAcceptedTos,
  });

  return {
    error: null,
    success: "อัปเดตชื่อที่แสดงเรียบร้อยแล้ว",
    fieldErrors: {},
    value: name,
  };
}