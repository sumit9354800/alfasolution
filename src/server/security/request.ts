import "server-only";
import { headers } from "next/headers";
import { env } from "../env";

/** Best-effort client IP (Hostinger and most proxies set x-forwarded-for). */
export function ipFromHeaders(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("cf-connecting-ip")?.trim() ||
    "unknown"
  ).slice(0, 64);
}

export async function getRequestMeta() {
  const h = await headers();
  return { ip: ipFromHeaders(h), userAgent: (h.get("user-agent") ?? "").slice(0, 255) };
}

/**
 * CSRF protection for route handlers that accept browser POSTs.
 * A state-changing request must come from our own origin. (Server Actions get
 * the same check from Next.js automatically.)
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin) {
    // Browsers always send Origin on cross-site POSTs; a missing Origin with a
    // same-site fetch metadata header is acceptable.
    const site = request.headers.get("sec-fetch-site");
    return site === "same-origin" || site === "none";
  }
  try {
    const originHost = new URL(origin).host;
    if (host && originHost === host) return true;
    return originHost === new URL(env.siteUrl).host;
  } catch {
    return false;
  }
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return Response.json({ success: false, message, ...extra }, { status });
}
