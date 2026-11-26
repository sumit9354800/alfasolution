import "server-only";
import { redirect } from "next/navigation";
import { can, type Permission } from "@/lib/rbac";
import { getCurrentAdmin, type AdminUser } from "./session";

export class AuthError extends Error {
  constructor(message = "You do not have permission to do that.") {
    super(message);
    this.name = "AuthError";
  }
}

/** For admin pages: redirects to login when signed out, to the dashboard when not permitted. */
export async function requirePageAccess(permission: Permission = "dashboard.view"): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  if (!can(user.role, permission)) redirect("/admin?denied=1");
  return user;
}

/** For server actions and API routes: throws instead of redirecting. */
export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) throw new AuthError("Your session has expired. Please sign in again.");
  if (!can(user.role, permission)) throw new AuthError();
  return user;
}
