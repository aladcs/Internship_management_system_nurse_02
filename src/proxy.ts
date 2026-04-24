import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthenticatedRedirectPath, getRoleRedirectPath, STUDENT_TOS_PATH } from "@/lib/auth/roles";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session-token";

const PUBLIC_INTERN_PREFIXES = [
  "/intern/auth/cmu",
  "/intern/auth/cmu/callback",
  "/intern/api/auth/callback",
  "/intern/api/student-profile-images",
] as const;

const ROLE_PROTECTED_PREFIXES = [
  {
    prefix: "/intern/admins",
    role: "super_admin",
  },
  {
    prefix: "/intern/dashboard",
    role: "admin",
  },
  {
    prefix: "/intern/admin/students",
    role: "admin",
  },
  {
    prefix: STUDENT_TOS_PATH,
    role: "student",
  },
  {
    prefix: "/intern/overview",
    role: "student",
  },
  {
    prefix: "/intern/form",
    role: "student",
  },
] as const;

function getRequiredRole(pathname: string) {
  return ROLE_PROTECTED_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix))?.role ?? null;
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

  if (session.role !== requiredRole) {
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