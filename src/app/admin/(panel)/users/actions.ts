"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { ROLES } from "@/lib/rbac";
import { adminAction, str, UserFacingError, ValidationError, zodFieldErrors } from "@/server/admin-action";
import { execute, queryOne } from "@/server/db";
import { logActivity } from "@/server/audit";
import { destroyAllSessionsFor, destroyOtherSessions, hashPassword, verifyPassword } from "@/server/auth/session";

const password = z.string().min(12, "Use at least 12 characters.").max(200).refine((v) => /[a-zA-Z]/.test(v) && /[0-9\W]/.test(v), "Mix letters with numbers or symbols.");

export async function createUser(_: ActionState, form: FormData) {
  return adminAction("users.manage", async (user) => {
    const r = z.object({ name: z.string().trim().min(2, "Enter a name.").max(120), email: z.string().trim().toLowerCase().email("Enter a valid email."), role: z.enum(ROLES), password }).safeParse({
      name: str(form, "name"), email: str(form, "email"), role: str(form, "role"), password: String(form.get("password") ?? ""),
    });
    if (!r.success) throw new ValidationError(zodFieldErrors(r.error));
    const res = await execute("INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [r.data.name, r.data.email, await hashPassword(r.data.password), r.data.role]);
    await logActivity(user.id, "create", "admin_user", res.insertId, `Added admin ${r.data.email} (${r.data.role})`);
    revalidatePath("/admin/users");
    return { status: "success", message: `${r.data.name} can now sign in.`, at: Date.now() };
  });
}

export async function updateUser(id: number, _: ActionState, form: FormData) {
  return adminAction("users.manage", async (user) => {
    const role = str(form, "role");
    if (!(ROLES as readonly string[]).includes(role)) throw new UserFacingError("Choose a role.");
    const active = form.get("is_active") === "on";
    if (id === user.id && (role !== "super_admin" || !active)) throw new UserFacingError("You can’t remove your own super admin access.");
    if (role !== "super_admin" || !active) {
      const others = await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM admin_users WHERE role = 'super_admin' AND is_active = 1 AND id <> ?", [id]);
      const target = await queryOne<{ role: string }>("SELECT role FROM admin_users WHERE id = ?", [id]);
      if (target?.role === "super_admin" && Number(others?.n) === 0) throw new UserFacingError("At least one active super admin is required.");
    }
    await execute("UPDATE admin_users SET role = ?, is_active = ? WHERE id = ?", [role, active ? 1 : 0, id]);
    if (!active) await destroyAllSessionsFor(id);
    const newPassword = String(form.get("password") ?? "");
    if (newPassword) {
      const p = password.safeParse(newPassword);
      if (!p.success) throw new ValidationError({ password: p.error.issues[0].message });
      await execute("UPDATE admin_users SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?", [await hashPassword(newPassword), id]);
      await destroyAllSessionsFor(id);
    }
    await logActivity(user.id, "update", "admin_user", id, `Updated admin #${id}: ${role}${active ? "" : ", deactivated"}${newPassword ? ", password reset" : ""}`);
    revalidatePath("/admin/users");
    return { status: "success", message: "User updated.", at: Date.now() };
  });
}

/** Any signed-in admin can change their own password. */
export async function changeOwnPassword(_: ActionState, form: FormData) {
  return adminAction("dashboard.view", async (user) => {
    const current = String(form.get("current") ?? "");
    const next = String(form.get("password") ?? "");
    const row = await queryOne<{ password_hash: string }>("SELECT password_hash FROM admin_users WHERE id = ?", [user.id]);
    if (!row || !(await verifyPassword(current, row.password_hash))) throw new ValidationError({ current: "Your current password is incorrect." });
    const p = password.safeParse(next);
    if (!p.success) throw new ValidationError({ password: p.error.issues[0].message });
    if (next !== String(form.get("confirm") ?? "")) throw new ValidationError({ confirm: "The passwords don’t match." });
    await execute("UPDATE admin_users SET password_hash = ? WHERE id = ?", [await hashPassword(next), user.id]);
    // Sign out other devices; keep this session.
    await destroyOtherSessions(user.id);
    await logActivity(user.id, "update", "admin_user", user.id, "Changed own password");
    return { status: "success", message: "Password changed. Other devices have been signed out.", at: Date.now() };
  });
}

export async function signOutEverywhere(_: ActionState, _form: FormData) {
  return adminAction("dashboard.view", async (user) => {
    await destroyAllSessionsFor(user.id);
    return { status: "success", message: "Signed out on all devices. Sign in again to continue.", at: Date.now() };
  });
}
