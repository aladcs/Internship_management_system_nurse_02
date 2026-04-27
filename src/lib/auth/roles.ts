import type { UserRole } from "@prisma/client";

export const STUDENT_TOS_PATH = "/intern/tos";

export const ROLE_REDIRECT_PATHS: Record<UserRole, string> = {
  super_admin: "/intern/admins",
  admin: "/intern/dashboard",
  student: "/intern/overview",
};

const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  super_admin: ["/intern/admins", "/intern/notifications", "/intern/account/name", "/intern/account/password"],
  admin: ["/intern/dashboard", "/intern/admin/students", "/intern/notifications", "/intern/account/name", "/intern/account/password"],
  student: [STUDENT_TOS_PATH, "/intern/overview", "/intern/form", "/intern/account/password"],
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