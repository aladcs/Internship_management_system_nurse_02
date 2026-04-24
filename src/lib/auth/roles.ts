import type { UserRole } from "@prisma/client";

export const ROLE_REDIRECT_PATHS: Record<UserRole, string> = {
  super_admin: "/intern/admins",
  admin: "/intern/dashboard",
  student: "/intern/overview",
};

const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  super_admin: ["/intern/admins"],
  admin: ["/intern/dashboard", "/intern/admin/students"],
  student: ["/intern/overview", "/intern/form"],
};

export function getRoleRedirectPath(role: UserRole) {
  return ROLE_REDIRECT_PATHS[role];
}

export function getSafePostLoginRedirectPath(role: UserRole, nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return getRoleRedirectPath(role);
  }

  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role];

  if (allowedPrefixes.some((prefix) => nextPath.startsWith(prefix))) {
    return nextPath;
  }

  return getRoleRedirectPath(role);
}