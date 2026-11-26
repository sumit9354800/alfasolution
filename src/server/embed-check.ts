import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { execute } from "./db";
import { env } from "./env";

/**
 * Decides whether a live website allows itself to be shown in an iframe by
 * reading its X-Frame-Options and Content-Security-Policy frame-ancestors
 * headers. Only URLs saved by admins are checked, and private/internal network
 * addresses are refused.
 */

function isPrivateAddress(address: string) {
  if (isIP(address) === 6) {
    const a = address.toLowerCase();
    return a === "::1" || a.startsWith("fc") || a.startsWith("fd") || a.startsWith("fe80") || a.startsWith("::ffff:127.") || a === "::";
  }
  const [a, b] = address.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

export type EmbedResult = "allowed" | "blocked" | "unknown";

export function evaluateFrameHeaders(headers: Headers, ourOrigin: string): EmbedResult {
  const xfo = headers.get("x-frame-options")?.toLowerCase().trim();
  if (xfo && (xfo.includes("deny") || xfo.includes("sameorigin"))) return "blocked";

  const csp = headers.get("content-security-policy");
  if (csp) {
    const directive = csp
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.toLowerCase().startsWith("frame-ancestors"));
    if (directive) {
      const sources = directive.split(/\s+/).slice(1).map((s) => s.toLowerCase());
      if (sources.includes("*")) return "allowed";
      const ourHost = new URL(ourOrigin).host.toLowerCase();
      const allowsUs = sources.some((source) => {
        const cleaned = source.replace(/^https?:\/\//, "").replace(/\/$/, "");
        if (cleaned === ourHost) return true;
        if (cleaned.startsWith("*.")) return ourHost.endsWith(cleaned.slice(1));
        return source === "https:";
      });
      return allowsUs ? "allowed" : "blocked";
    }
  }
  return "allowed";
}

export async function checkEmbeddable(url: string): Promise<EmbedResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "unknown";
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "unknown";
  try {
    const addresses = await lookup(parsed.hostname, { all: true });
    if (!addresses.length || addresses.some((entry) => isPrivateAddress(entry.address))) return "unknown";
    const response = await fetch(parsed, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "AlfaSolution-EmbedCheck/1.0" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    void response.body?.cancel();
    return evaluateFrameHeaders(response.headers, env.siteUrl);
  } catch {
    return "unknown";
  }
}

export async function refreshEmbedStatus(projectId: number, url: string | null) {
  const status = url ? await checkEmbeddable(url) : "unknown";
  await execute("UPDATE portfolio_projects SET embed_status = ?, embed_checked_at = UTC_TIMESTAMP() WHERE id = ?", [status, projectId]);
  return status;
}
