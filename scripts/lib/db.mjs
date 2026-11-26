// Shared database connection for CLI scripts (migrate, seed, create-admin).
// Reads the same environment variables as the application.
import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

const root = process.cwd();
// .env.local overrides .env, matching Next.js precedence.
for (const file of [".env.local", ".env"]) {
  const full = path.join(root, file);
  if (existsSync(full)) dotenv.config({ path: full, override: false, quiet: true });
}

export function getDbConfig() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
    };
  }
  const required = ["DB_HOST", "DB_USER", "DB_NAME"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing database settings: ${missing.join(", ")}. Copy .env.example to .env.local and fill them in.`
    );
  }
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  };
}

export async function connect(options = {}) {
  const config = getDbConfig();
  const connection = await mysql.createConnection({
    ...config,
    charset: "utf8mb4",
    timezone: "Z",
    multipleStatements: Boolean(options.multipleStatements),
  });
  await connection.query("SET time_zone = '+00:00'");
  return connection;
}
