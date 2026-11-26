"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/action-state";
import { execute, queryOne } from "@/server/db";
import { burnPasswordCheck, createSession, destroySession, verifyPassword } from "@/server/auth/session";
import { logActivity } from "@/server/audit";
import { clearRateLimit, rateLimit } from "@/server/security/rate-limit";
import { getRequestMeta } from "@/server/security/request";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(191),
  password: z.string().min(1).max(200),
});

const GENERIC = "Email or password is incorrect.";
const LOCK_AFTER = 5;
const LOCK_MINUTES = 15;

export async function loginAction(_: ActionState, form: FormData): Promise<ActionState> {
  const meta = await getRequestMeta();
  if (!(await rateLimit(`login-ip:${meta.ip}`, 20, 900))) {
    return { status: "error", message: "Too many sign-in attempts. Wait 15 minutes and try again.", at: Date.now() };
  }

  const parsed = schema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { status: "error", message: "Enter your email and password.", at: Date.now() };
  const { email, password } = parsed.data;

  const user = await queryOne<{ id: number; password_hash: string; is_active: number; failed_attempts: number; locked: number }>(
    "SELECT id, password_hash, is_active, failed_attempts, (locked_until IS NOT NULL AND locked_until > UTC_TIMESTAMP()) AS locked FROM admin_users WHERE email = ?",
    [email]
  );

  if (!user) {
    await burnPasswordCheck(password);
    return { status: "error", message: GENERIC, at: Date.now() };
  }
  if (user.locked) {
    return { status: "error", message: `This account is temporarily locked after repeated failed attempts. Try again in ${LOCK_MINUTES} minutes.`, at: Date.now() };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid || !user.is_active) {
    const attempts = user.failed_attempts + 1;
    await execute(
      `UPDATE admin_users SET failed_attempts = ?, locked_until = IF(? >= ?, UTC_TIMESTAMP() + INTERVAL ? MINUTE, NULL) WHERE id = ?`,
      [attempts >= LOCK_AFTER ? 0 : attempts, attempts, LOCK_AFTER, LOCK_MINUTES, user.id]
    );
    await logActivity(user.id, "login_failed", "auth", user.id, `Failed sign-in from ${meta.ip}`);
    return { status: "error", message: GENERIC, at: Date.now() };
  }

  await execute("UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login_at = UTC_TIMESTAMP() WHERE id = ?", [user.id]);
  await clearRateLimit(`login-ip:${meta.ip}`);
  await createSession(user.id, meta);
  await logActivity(user.id, "login", "auth", user.id, `Signed in from ${meta.ip}`);

  const next = String(form.get("next") ?? "");
  redirect(/^\/admin(\/[\w\-/?=&%.]*)?$/.test(next) ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
