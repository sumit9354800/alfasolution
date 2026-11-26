import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic admin gate: requests to /admin without a session cookie are sent
 * to the login page before any rendering happens. The session itself is fully
 * verified against the database in every admin page, server action and API
 * route — this check only avoids rendering work for signed-out visitors.
 */
const COOKIE_NAMES = ["__Host-alfa_admin", "alfa_admin"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const hasSession = COOKIE_NAMES.some((name) => request.cookies.has(name));
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
