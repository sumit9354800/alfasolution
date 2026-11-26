import "server-only";
import path from "node:path";

/**
 * Central access to server configuration. Every value comes from environment
 * variables so the same code runs on XAMPP locally and on Hostinger in
 * production — only the .env values change.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value === "" ? undefined : value;
}

function requireSecret(name: string): string {
  const value = read(name);
  if (!value || value.length < 32) {
    throw new Error(`${name} must be set to a random string of at least 32 characters.`);
  }
  return value;
}

export const isProduction = process.env.NODE_ENV === "production";

export const env = {
  get siteUrl() {
    return (read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000").replace(/\/+$/, "");
  },
  get sessionSecret() {
    return requireSecret("SESSION_SECRET");
  },
  get sessionHours() {
    const hours = Number(read("ADMIN_SESSION_HOURS") ?? 8);
    return Number.isFinite(hours) && hours > 0 && hours <= 72 ? hours : 8;
  },
  get storageDir() {
    // Runtime-configured folder; excluded from build-time file tracing.
    return path.resolve(/*turbopackIgnore: true*/ process.cwd(), read("STORAGE_DIR") ?? "./storage");
  },
  get mail() {
    return {
      apiKey: read("RESEND_API_KEY"),
      from: read("CONTACT_FROM_EMAIL"),
      to: read("CONTACT_TO_EMAIL"),
    };
  },
  get razorpay() {
    const keyId = read("RAZORPAY_KEY_ID");
    const keySecret = read("RAZORPAY_KEY_SECRET");
    // A custom API base is only honoured outside production (used for local tests).
    const apiBase = !isProduction && read("RAZORPAY_API_BASE") ? read("RAZORPAY_API_BASE")! : "https://api.razorpay.com";
    return {
      keyId,
      keySecret,
      webhookSecret: read("RAZORPAY_WEBHOOK_SECRET"),
      apiBase: apiBase.replace(/\/+$/, ""),
      configured: Boolean(keyId && keySecret),
    };
  },
};

export function getDatabaseConfig() {
  const url = read("DATABASE_URL");
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ""),
    };
  }
  const host = read("DB_HOST");
  const user = read("DB_USER");
  const database = read("DB_NAME");
  if (!host || !user || !database) {
    throw new Error("Database is not configured. Set DB_HOST, DB_USER and DB_NAME (or DATABASE_URL).");
  }
  return {
    host,
    port: Number(read("DB_PORT") ?? 3306),
    user,
    password: read("DB_PASSWORD") ?? "",
    database,
  };
}
