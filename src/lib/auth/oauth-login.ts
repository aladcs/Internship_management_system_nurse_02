import { type UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSafePostLoginRedirectPath } from "@/lib/auth/roles";
import { createSession } from "@/lib/auth/session";

type SignInOAuthUserInput = {
  email: string;
  nextPath?: string | null;
};

type SignInOAuthUserResult =
  | {
      ok: true;
      redirectPath: string;
    }
  | {
      ok: false;
      errorCode: "email_not_allowed";
    };

function splitStudentName(name: string | null) {
  const parts = (name ?? "").split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] ?? null,
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

export function normalizeOAuthNextPath(nextPath: string | null | undefined) {
  const normalized = nextPath?.trim();

  if (!normalized || !normalized.startsWith("/") || normalized.startsWith("//")) {
    return null;
  }

  return normalized;
}

export async function signInOAuthUser({
  email,
  nextPath,
}: SignInOAuthUserInput): Promise<SignInOAuthUserResult> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      studentProfile: {
        select: {
          id: true,
          tosAcceptedAt: true,
        },
      },
    },
  });

  if (!user) {
    return {
      ok: false,
      errorCode: "email_not_allowed",
    };
  }

  if (user.role === "student" && !user.studentProfile) {
    const { firstName, lastName } = splitStudentName(user.name);

    await prisma.student.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
        firstName,
        lastName,
      },
    });
  }

  const studentHasAcceptedTos =
    user.role === ("student" satisfies UserRole)
      ? Boolean(user.studentProfile?.tosAcceptedAt)
      : undefined;

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name ?? null,
    studentHasAcceptedTos,
  });

  return {
    ok: true,
    redirectPath: getSafePostLoginRedirectPath(
      {
        role: user.role as UserRole,
        studentHasAcceptedTos,
      },
      nextPath,
    ),
  };
}