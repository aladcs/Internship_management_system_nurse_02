import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserRole } from "@prisma/client";
import { getAuthenticatedRedirectPath, getRoleRedirectPath, STUDENT_TOS_PATH } from "@/lib/auth/roles";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session-token";

const PUBLIC_INTERN_PREFIXES = [
  "/intern/auth/cmu",
  "/intern/auth/cmu/callback",
  "/intern/auth/google",
  "/intern/auth/google/callback",
  "/intern/api/auth/callback",
  "/intern/api/student-profile-images",
  "/intern/api/student-files",
] as const;

const ROLE_PROTECTED_PREFIXES = [
  {
    prefix: "/intern/admins",
    roles: ["super_admin"],
  },
  {
    prefix: "/intern/dashboard",
    roles: ["admin"],
  },
  {
    prefix: "/intern/admin/students",
    roles: ["admin"],
  },
  {
    prefix: "/intern/notifications",
    roles: ["admin", "super_admin"],
  },
  {
    prefix: STUDENT_TOS_PATH,
    roles: ["student"],
  },
  {
    prefix: "/intern/overview",
    roles: ["student"],
  },
  {
    prefix: "/intern/form",
    roles: ["student"],
  },
] as const;

function getRequiredRole(pathname: string): readonly UserRole[] | null {
  return ROLE_PROTECTED_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix))?.roles ?? null;
}

function isPublicInternPath(pathname: string) {
  return PUBLIC_INTERN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextPath !== "/login") {
    loginUrl.searchParams.set("next", nextPath);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isPublicInternPath(pathname)) {
    return NextResponse.next();
  }

  const requiredRole = getRequiredRole(pathname);

  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return pathname.startsWith("/intern") ? redirectToLogin(request) : NextResponse.next();
  }

  if (!requiredRole) {
    if (
      session.role === "student" &&
      !session.studentHasAcceptedTos &&
      pathname.startsWith("/intern") &&
      !pathname.startsWith(STUDENT_TOS_PATH)
    ) {
      return NextResponse.redirect(new URL(STUDENT_TOS_PATH, request.url));
    }

    return NextResponse.next();
  }

  if (!requiredRole.includes(session.role)) {
    return NextResponse.redirect(new URL(getAuthenticatedRedirectPath(session), request.url));
  }

  if (session.role === "student") {
    if (!session.studentHasAcceptedTos && !pathname.startsWith(STUDENT_TOS_PATH)) {
      return NextResponse.redirect(new URL(STUDENT_TOS_PATH, request.url));
    }

    if (session.studentHasAcceptedTos && pathname.startsWith(STUDENT_TOS_PATH)) {
      return NextResponse.redirect(new URL(getRoleRedirectPath(session.role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/intern/:path*",
  ],
};