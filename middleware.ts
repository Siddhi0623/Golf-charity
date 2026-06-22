import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware kept intentionally LIGHT to stay under Vercel's edge timeout.
 *
 * Responsibilities (only):
 *   1. Refresh the Supabase session cookie on every request.
 *   2. Bounce already-signed-in users away from /login & /register.
 *   3. Bounce signed-out users away from /dashboard, /scores, /draws,
 *      /winnings, /settings, /admin (sends them to /login).
 *
 * Everything else — admin role gating, subscription gating — happens in
 * the layouts (`(app)/layout.tsx`, `(admin)/layout.tsx`) so we don't pay
 * round-trip latency twice. Database-level RLS is the source of truth.
 */

const AUTH_PAGES = ["/login", "/register", "/forgot-password"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/scores",
  "/draws",
  "/winnings",
  "/settings",
  "/admin",
];

function isProtected(path: string) {
  return PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static + API + auth-callback. Saves Supabase round-trip on
  // every image / script / API call.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/callback") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // Fail-open: if updateSession errors or hangs we let the request through.
  // The layouts re-check auth server-side anyway (defense in depth via RLS).
  let response: NextResponse;
  let user: { id: string } | null = null;
  try {
    const updated = await Promise.race([
      updateSession(request),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("middleware: updateSession timeout")), 4000),
      ),
    ]);
    response = updated.response;
    user = updated.user;
  } catch (err) {
    console.error("[middleware] updateSession failed:", err);
    return NextResponse.next();
  }

  // Logged-in user trying to hit /login or /register → dashboard.
  if (user && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Anonymous user trying to hit protected route → /login.
  if (!user && isProtected(pathname)) {
    const redirect = new URL("/login", request.url);
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: [
    // Match everything except internals & static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
