// Creates (or resets the password of) an admin user.
// Usage:
//   npm run admin:create -- --email you@alfasolution.net --name "Your Name" --password "a-long-password" [--role super_admin]
import bcrypt from "bcryptjs";
import { connect } from "./lib/db.mjs";

const ROLES = ["super_admin", "admin", "editor", "hr", "accounts"];

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = (arg("email") || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const name = (arg("name") || process.env.ADMIN_NAME || "Administrator").trim();
  const password = arg("password") || process.env.ADMIN_PASSWORD || "";
  const role = arg("role") || "super_admin";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Pass a valid --email.");
  if (password.length < 12) throw new Error("Password must be at least 12 characters.");
  if (!ROLES.includes(role)) throw new Error(`Role must be one of: ${ROLES.join(", ")}`);

  const hash = await bcrypt.hash(password, 12);
  const connection = await connect();
  try {
    await connection.execute(
      `INSERT INTO admin_users (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash),
         role = VALUES(role), is_active = 1, failed_attempts = 0, locked_until = NULL`,
      [name, email, hash, role]
    );
    console.log(`Admin ready: ${email} (${role}). Sign in at /admin/login`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
