import type { UserRole } from "@prisma/client";

export const STUDENT_TOS_PATH = "/tos";

export const ROLE_REDIRECT_PATHS: Record<UserRole, string> = {
  super_admin: "/admins",
  admin: "/dashboard",
  student: "/overview",
};

const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  super_admin: ["/admins", "/account/name", "/account/password"],
  admin: ["/dashboard", "/admin/students", "/notifications", "/activity-logs", "/account/name", "/account/password"],
  student: [STUDENT_TOS_PATH, "/overview", "/form", "/account/password"],
};

type AuthenticatedRedirectInput = {
  role: UserRole;
  studentHasAcceptedTos?: boolean;
};

export function getRoleRedirectPath(role: UserRole) {
  return ROLE_REDIRECT_PATHS[role];
}

export function getAuthenticatedRedirectPath(input: AuthenticatedRedirectInput) {
  if (input.role === "student" && !input.studentHasAcceptedTos) {
    return STUDENT_TOS_PATH;
  }

  return getRoleRedirectPath(input.role);
}

export function getSafePostLoginRedirectPath(
  input: AuthenticatedRedirectInput,
  nextPath: string | null | undefined,
) {
  const fallbackPath = getAuthenticatedRedirectPath(input);

  if (input.role === "student" && !input.studentHasAcceptedTos) {
    return fallbackPath;
  }

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallbackPath;
  }

  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[input.role];

  if (allowedPrefixes.some((prefix) => nextPath.startsWith(prefix))) {
    if (input.role === "student" && nextPath.startsWith(STUDENT_TOS_PATH)) {
      return getRoleRedirectPath(input.role);
    }

    return nextPath;
  }

  return fallbackPath;
}