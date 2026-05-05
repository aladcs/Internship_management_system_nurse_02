import { NextResponse } from "next/server";
import { getSafePostLoginRedirectPath } from "@/lib/auth/roles";
import { createSession, clearSession, readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { withAppBasePath } from "@/lib/app-paths";

const STUDENT_PROFILE_MISSING_REDIRECT = "/login?cmu=student_profile_missing";

function buildRedirectUrl(requestUrl: string, pathname: string) {
  return new URL(withAppBasePath(pathname), requestUrl);
}

export async function GET(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.redirect(buildRedirectUrl(request.url, "/login"));
  }

  const requestUrl = new URL(request.url);
  const nextPath = requestUrl.searchParams.get("next");

  if (session.role !== "student") {
    return NextResponse.redirect(
      buildRedirectUrl(
        request.url,
        getSafePostLoginRedirectPath(
          {
            role: session.role,
            studentHasAcceptedTos: session.studentHasAcceptedTos,
          },
          nextPath,
        ),
      ),
    );
  }

  const student = await prisma.student.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      tosAcceptedAt: true,
    },
  });

  if (!student) {
    await clearSession();

    return NextResponse.redirect(
      buildRedirectUrl(request.url, STUDENT_PROFILE_MISSING_REDIRECT),
    );
  }

  const studentHasAcceptedTos = Boolean(student.tosAcceptedAt);

  if (studentHasAcceptedTos !== Boolean(session.studentHasAcceptedTos)) {
    await createSession({
      userId: session.userId,
      email: session.email,
      role: session.role,
      name: session.name,
      studentHasAcceptedTos,
    });
  }

  return NextResponse.redirect(
    buildRedirectUrl(
      request.url,
      getSafePostLoginRedirectPath(
        {
          role: session.role,
          studentHasAcceptedTos,
        },
        nextPath,
      ),
    ),
  );
}
