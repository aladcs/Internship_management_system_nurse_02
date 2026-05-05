import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserRole } from "@prisma/client";
import {
  isAppExternalPath,
  stripAppBasePath,
  withAppBasePath,
} from "@/lib/app-paths";
import { getAuthenticatedRedirectPath, getRoleRedirectPath, STUDENT_TOS_PATH } from "@/lib/auth/roles";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session-token";

const PUBLIC_INTERN_PREFIXES = [
  "/auth/cmu",
  "/auth/cmu/callback",
  "/auth/google",
  "/auth/google/callback",
  "/api/auth/callback",
  "/api/student-profile-images",
  "/api/student-files",
] as const;

const ROLE_PROTECTED_PREFIXES = [
  {
    prefix: "/admins",
    roles: ["super_admin"],
  },
  {
    prefix: "/dashboard",
    roles: ["admin"],
  },
  {
    prefix: "/admin/students",
    roles: ["admin"],
  },
  {
    prefix: "/notifications",
    roles: ["admin"],
  },
  {
    prefix: "/activity-logs",
    roles: ["admin"],
  },
  {
    prefix: STUDENT_TOS_PATH,
    roles: ["student"],
  },
  {
    prefix: "/overview",
    roles: ["student"],
  },
  {
    prefix: "/form",
    roles: ["student"],
  },
] as const;

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );

  return response;
}

function getRequiredRole(pathname: string): readonly UserRole[] | null {
  return ROLE_PROTECTED_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix))?.roles ?? null;
}

function isPublicInternPath(pathname: string) {
  return PUBLIC_INTERN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL(withAppBasePath("/login"), request.url);
  const nextPath = `${stripAppBasePath(request.nextUrl.pathname)}${request.nextUrl.search}`;

  if (nextPath !== "/login") {
    loginUrl.searchParams.set("next", nextPath);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE_NAME);

  return applySecurityHeaders(response);
}

export function proxy(request: NextRequest) {
  const pathname = stripAppBasePath(request.nextUrl.pathname);

  if (isPublicInternPath(pathname)) {
    return applySecurityHeaders(NextResponse.next());
  }

  const requiredRole = getRequiredRole(pathname);

  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return isAppExternalPath(request.nextUrl.pathname)
      ? redirectToLogin(request)
      : applySecurityHeaders(NextResponse.next());
  }

  if (!requiredRole) {
    if (
      session.role === "student" &&
      !session.studentHasAcceptedTos &&
      isAppExternalPath(request.nextUrl.pathname) &&
      !pathname.startsWith(STUDENT_TOS_PATH)
    ) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL(withAppBasePath(STUDENT_TOS_PATH), request.url)),
      );
    }

    return applySecurityHeaders(NextResponse.next());
  }

  if (!requiredRole.includes(session.role)) {
    return applySecurityHeaders(
      NextResponse.redirect(
        new URL(withAppBasePath(getAuthenticatedRedirectPath(session)), request.url),
      ),
    );
  }

  if (session.role === "student") {
    if (!session.studentHasAcceptedTos && !pathname.startsWith(STUDENT_TOS_PATH)) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL(withAppBasePath(STUDENT_TOS_PATH), request.url)),
      );
    }

    if (session.studentHasAcceptedTos && pathname.startsWith(STUDENT_TOS_PATH)) {
      return applySecurityHeaders(
        NextResponse.redirect(
          new URL(withAppBasePath(getRoleRedirectPath(session.role)), request.url),
        ),
      );
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/intern/:path*",
  ],
};
