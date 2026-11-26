import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { execute, queryOne } from "../db";
import { env, isProduction } from "../env";
import type { Role } from "@/lib/rbac";

export const SESSION_COOKIE = isProduction ? "__Host-alfa_admin" : "alfa_admin";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

// --- Passwords --------------------------------------------------------------

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Constant-ish time dummy compare so unknown emails take as long as known ones. */
let dummyHash: Promise<string> | null = null;
export async function burnPasswordCheck(password: string) {
  dummyHash ??= bcrypt.hash("dummy-password-for-timing", 12);
  await bcrypt.compare(password, await dummyHash).catch(() => false);
}

// --- Sessions ---------------------------------------------------------------
// The cookie holds a random 256-bit token. The database stores only an HMAC of
// it, so a database leak cannot be turned into a working session.

function hashToken(token: string) {
  return createHmac("sha256", env.sessionSecret).update(token).digest("hex");
}

export async function createSession(userId: number, meta: { ip: string; userAgent: string }) {
  const token = randomBytes(32).toString("base64url");
  const hours = env.sessionHours;
  await execute(
    `INSERT INTO admin_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
     VALUES (?, ?, ?, ?, UTC_TIMESTAMP() + INTERVAL ? HOUR)`,
    [userId, hashToken(token), meta.ip, meta.userAgent, hours]
  );
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    // The database row is the real expiry (sliding); the cookie just needs to outlive it.
    maxAge: 7 * 24 * 3600,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await execute("DELETE FROM admin_sessions WHERE token_hash = ?", [hashToken(token)]);
  jar.delete(SESSION_COOKIE);
}

/** Signs a user out everywhere except the current browser. */
export async function destroyOtherSessions(userId: number) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  await execute("DELETE FROM admin_sessions WHERE user_id = ? AND token_hash <> ?", [userId, hashToken(token)]);
}

export async function destroyAllSessionsFor(userId: number) {
  await execute("DELETE FROM admin_sessions WHERE user_id = ?", [userId]);
}

/** Resolves the signed-in admin for this request (memoised per request). */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  const row = await queryOne<AdminUser & { session_id: number; seconds_left: number; is_active: number }>(
    `SELECT u.id, u.name, u.email, u.role, u.is_active, s.id AS session_id,
            TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), s.expires_at) AS seconds_left
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()
      LIMIT 1`,
    [hashToken(token)]
  );
  if (!row || !row.is_active) return null;

  // Sliding expiry: extend when less than half of the session remains.
  const total = env.sessionHours * 3600;
  if (row.seconds_left < total / 2) {
    await execute(
      "UPDATE admin_sessions SET expires_at = UTC_TIMESTAMP() + INTERVAL ? HOUR, last_seen_at = UTC_TIMESTAMP() WHERE id = ?",
      [env.sessionHours, row.session_id]
    );
  }
  return { id: row.id, name: row.name, email: row.email, role: row.role };
});
