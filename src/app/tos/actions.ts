"use server";

import { redirect } from "next/navigation";
import { clearSession, createSession, readSession } from "@/lib/auth/session";
import { getAuthenticatedRedirectPath } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";

const ACCEPT_REQUIRED_REDIRECT = "/tos?error=accept_required";
const STUDENT_PROFILE_MISSING_REDIRECT = "/login?cmu=student_profile_missing";

async function requireStudentSession() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "student") {
    redirect(getAuthenticatedRedirectPath(session));
  }

  return session;
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function acceptStudentTosAction(formData: FormData) {
  const session = await requireStudentSession();

  if (String(formData.get("accepted") ?? "") !== "yes") {
    redirect(ACCEPT_REQUIRED_REDIRECT);
  }

  const student = await prisma.student.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      id: true,
      tosAcceptedAt: true,
    },
  });

  if (!student) {
    await clearSession();
    redirect(STUDENT_PROFILE_MISSING_REDIRECT);
  }

  if (!student.tosAcceptedAt) {
    await prisma.student.update({
      where: {
        id: student.id,
      },
      data: {
        tosAcceptedAt: new Date(),
      },
    });
  }

  await createSession({
    userId: session.userId,
    email: session.email,
    role: session.role,
    name: session.name,
    studentHasAcceptedTos: true,
  });

  redirect("/overview");
}