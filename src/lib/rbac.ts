// Role-based access control. Shared by server checks and admin navigation.

export const ROLES = ["super_admin", "admin", "editor", "hr", "accounts"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  editor: "Content editor",
  hr: "HR / Recruitment",
  accounts: "Accounts & sales",
};

export type Permission =
  | "dashboard.view"
  | "content.manage"
  | "blog.manage"
  | "portfolio.manage"
  | "careers.manage"
  | "enquiries.manage"
  | "clients.manage"
  | "finance.manage"
  | "settings.manage"
  | "users.manage"
  | "activity.view";

const ALL: Permission[] = [
  "dashboard.view",
  "content.manage",
  "blog.manage",
  "portfolio.manage",
  "careers.manage",
  "enquiries.manage",
  "clients.manage",
  "finance.manage",
  "settings.manage",
  "users.manage",
  "activity.view",
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ALL,
  admin: ALL.filter((permission) => permission !== "users.manage"),
  editor: ["dashboard.view", "content.manage", "blog.manage", "portfolio.manage"],
  hr: ["dashboard.view", "careers.manage"],
  accounts: ["dashboard.view", "enquiries.manage", "clients.manage", "finance.manage"],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function permissionsFor(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
