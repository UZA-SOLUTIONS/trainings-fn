import type { StaffUser } from "@/services/authService";
import type { DashboardTab } from "@/components/dashboard/types";

export type PermissionAction =
  | "cohorts.write"
  | "institutions.write"
  | "candidates.read"
  | "candidates.membership"
  | "candidates.training"
  | "candidates.documents"
  | "candidates.loan"
  | "staff.manage";

const TAB_ACCESS: Record<DashboardTab, StaffUser["role"][]> = {
  overview: ["admin", "instructor", "bank_partner"],
  cohorts: ["admin", "instructor", "bank_partner"],
  courses: ["admin", "instructor"],
  modules: ["admin", "instructor"],
  candidates: ["admin", "instructor", "bank_partner"],
  banks: ["admin"],
  profile: ["admin", "instructor", "bank_partner"],
  settings: ["admin", "instructor", "bank_partner"],
};

export function roleLabel(role: StaffUser["role"]): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "instructor":
      return "Instructor";
    case "bank_partner":
      return "Bank partner";
    default:
      return role;
  }
}

export function can(user: StaffUser | null, action: PermissionAction): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;

  switch (action) {
    case "cohorts.write":
    case "institutions.write":
    case "staff.manage":
      return false;
    case "candidates.read":
      return user.role === "instructor" || user.role === "bank_partner";
    case "candidates.membership":
    case "candidates.training":
      return user.role === "instructor";
    case "candidates.documents":
    case "candidates.loan":
      return user.role === "bank_partner";
    default:
      return false;
  }
}

export function canAccessTab(user: StaffUser | null, tab: DashboardTab): boolean {
  if (!user) return false;
  return TAB_ACCESS[tab].includes(user.role);
}

export function defaultTabForRole(role: StaffUser["role"]): DashboardTab {
  if (role === "bank_partner") return "candidates";
  return "overview";
}

export function isInstructor(user: StaffUser | null): boolean {
  return user?.role === "instructor";
}

export function isBankPartner(user: StaffUser | null): boolean {
  return user?.role === "bank_partner";
}

export function isAdmin(user: StaffUser | null): boolean {
  return user?.role === "admin";
}
