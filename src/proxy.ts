import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRoleRedirectPath } from "@/lib/auth/roles";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session-token";

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
  const requiredRole = getRequiredRole(request.nextUrl.pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return redirectToLogin(request);
  }

  if (session.role !== requiredRole) {
    return NextResponse.redirect(new URL(getRoleRedirectPath(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/intern/admins/:path*",
    "/intern/dashboard/:path*",
    "/intern/admin/students/:path*",
    "/intern/overview/:path*",
    "/intern/form/:path*",
  ],
};