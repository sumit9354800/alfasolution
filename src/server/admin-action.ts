import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { ZodError } from "zod";
import type { Permission } from "@/lib/rbac";
import type { ActionState } from "@/lib/action-state";
import { AuthError, requirePermission } from "./auth/guard";
import type { AdminUser } from "./auth/session";

export class ValidationError extends Error {
  constructor(public errors: Record<string, string>, message = "Fix the highlighted fields and try again.") {
    super(message);
  }
}

export class UserFacingError extends Error {}

export function zodFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/**
 * Every admin server action runs through this wrapper:
 *  1. verifies the session and the permission (server-side, on every call),
 *  2. turns validation / duplicate-key / permission problems into form messages,
 *  3. logs unexpected errors without leaking details to the browser.
 * Next.js additionally rejects server-action calls from other origins (CSRF).
 */
export async function adminAction(permission: Permission, work: (user: AdminUser) => Promise<ActionState | void>): Promise<ActionState> {
  try {
    const user = await requirePermission(permission);
    const result = await work(user);
    return result ?? { status: "success", message: "Saved.", at: Date.now() };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ValidationError) return { status: "error", message: error.message, errors: error.errors, at: Date.now() };
    if (error instanceof AuthError || error instanceof UserFacingError) return { status: "error", message: error.message, at: Date.now() };
    const code = (error as { code?: string })?.code;
    if (code === "ER_DUP_ENTRY") {
      return { status: "error", message: "That value is already in use. Slugs, emails and numbers must be unique.", at: Date.now() };
    }
    if (code === "ER_ROW_IS_REFERENCED_2" || code === "ER_ROW_IS_REFERENCED") {
      return { status: "error", message: "This record is linked to other records and can’t be deleted. Archive or unlink it instead.", at: Date.now() };
    }
    console.error("[admin action] failed", error);
    return { status: "error", message: "Something went wrong while saving. Please try again.", at: Date.now() };
  }
}

// --- FormData helpers --------------------------------------------------------

export function str(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function optStr(form: FormData, key: string) {
  return str(form, key) || null;
}

export function bool(form: FormData, key: string) {
  const value = form.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function num(form: FormData, key: string) {
  const raw = str(form, key);
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : NaN;
}

/** One item per line, blanks removed. */
export function lines(form: FormData, key: string, max = 60) {
  return str(form, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function idParam(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
