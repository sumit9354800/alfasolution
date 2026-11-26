import "server-only";
import { execute, queryOne } from "../db";
import { hashPassword } from "./session";

/**
 * First-run convenience for hosts without a terminal (e.g. Hostinger hPanel):
 * if there are no admin users yet and BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD
 * are set, create that super admin. Does nothing once any admin exists.
 * Remove the two variables after your first sign-in.
 */
export async function ensureBootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "";
  if (!email || password.length < 12 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
  try {
    const row = await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM admin_users");
    if (Number(row?.n) > 0) return;
    await execute("INSERT IGNORE INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, 'super_admin')", [
      process.env.BOOTSTRAP_ADMIN_NAME?.trim() || "Administrator",
      email,
      await hashPassword(password),
    ]);
    console.info(`[bootstrap] created super admin ${email}. Remove BOOTSTRAP_ADMIN_* variables now.`);
  } catch (error) {
    console.error("[bootstrap] could not create the first admin", error);
  }
}
