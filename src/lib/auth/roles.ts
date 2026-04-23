import type { UserRole } from "@prisma/client";

export const ROLE_REDIRECT_PATHS: Record<UserRole, string> = {
  super_admin: "/intern/admins",
  admin: "/intern/dashboard",
  student: "/intern/overview",
};

export function getRoleRedirectPath(role: UserRole) {
  return ROLE_REDIRECT_PATHS[role];
}