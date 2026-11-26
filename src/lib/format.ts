// Formatting helpers shared by server and client code.

/** Rounds to 2 decimals without binary floating-point drift (e.g. 1.005 → 1.01). */
export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Rupees → paise as an integer, as Razorpay expects. */
export function toPaise(amount: number) {
  return Math.round(round2(amount) * 100);
}

export function formatMoney(amount: number | string | null | undefined, currency = "INR") {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2, minimumFractionDigits: value % 1 ? 2 : 0 }).format(value);
}

/** Plain-ASCII money for PDFs (standard PDF fonts have no ₹ glyph). */
export function formatMoneyPlain(amount: number | string | null | undefined, currency = "INR") {
  const value = Number(amount ?? 0);
  return `${currency} ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
}

const IST = "Asia/Kolkata";

export function formatDate(value: Date | string | null | undefined, style: "short" | "long" = "short") {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

/** yyyy-mm-dd for <input type="date">, in IST. */
export function toDateInput(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** yyyy-mm-ddThh:mm for <input type="datetime-local">, in IST. */
export function toDateTimeInput(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Parses an IST datetime-local string to a UTC Date. */
export function fromISTInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 150);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function hostOf(url: string | null | undefined) {
  if (!url) return "";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Only local files and the configured image CDN go through Next.js image optimisation. */
export function canOptimizeImage(src: string) {
  if (src.startsWith("/media/")) return false;
  if (src.startsWith("/")) return true;
  try {
    return new URL(src).hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}
