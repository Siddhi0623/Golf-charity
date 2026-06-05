import type { UserRole } from "@/types/domain";

export function isAdmin(role: UserRole | undefined | null): boolean {
  return role === "ADMIN";
}

export function canAccessAdminPanel(role: UserRole | undefined | null): boolean {
  return isAdmin(role);
}

export function canManageDraws(role: UserRole | undefined | null): boolean {
  return isAdmin(role);
}

export function canVerifyWinners(role: UserRole | undefined | null): boolean {
  return isAdmin(role);
}
