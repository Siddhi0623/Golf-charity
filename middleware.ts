import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Route map
 * ---------
 *  Public          — landing, charities, pricing, about, how-it-works
 *  Auth-required   — anything under (app) and (admin)
 *  Admin-only      — anything under /admin
 *  Sub-required    — score entry + draw participation routes
 *                    (dashboard itself is read-only when inactive)
 *
 * Database-level RLS is the source of truth. This middleware is the cheap
 * edge filter that redirects users before any DB call happens.
 */

const PUBLIC_PREFIXES = ["/", "/about", "/charities", "/pricing", "/how-it-works"];
const AUTH_PREFIXES = ["/login", "/register", "/forgot-password", "/auth"];
const ADMIN_PREFIX = "/admin";
const APP_PREFIXES = ["/dashboard", "/scores", "/draws", "/winnings", "/settings"];
const SUB_GATED_PREFIXES = ["/scores", "/draws"];

function startsWithAny(path: string, prefixes: string[]) {
  return prefixes.some(
    (p) => path === p || path.startsWith(p === "/" ? "/__never__" : `${p}/`) || path === p,
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static/internal routes.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const { response, supabase, user } = await updateSession(request);

  // Already logged in & visiting login/register → bounce to dashboard.
  if (user && startsWithAny(pathname, AUTH_PREFIXES) && pathname !== "/auth/callback") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Public routes: no further checks.
  if (
    pathname === "/" ||
    PUBLIC_PREFIXES.some((p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`))) ||
    startsWithAny(pathname, AUTH_PREFIXES)
  ) {
    return response;
  }

  // Protected: must be logged in.
  const requiresAuth =
    pathname.startsWith(ADMIN_PREFIX) ||
    APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (requiresAuth && !user) {
    const redirect = new URL("/login", request.url);
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  if (!user) return response;

  // Look up role + subscription in a single round-trip.
  const [profileResult, subResult] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status, expiry_date")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .maybeSingle(),
  ]);
  // Explicit casts needed because supabase-js v2 column-select inference
  // produces `never` when the Database type is a placeholder.
  const profile = profileResult.data as { role: "USER" | "ADMIN" } | null;
  const sub = subResult.data as {
    status: "ACTIVE" | "EXPIRED" | "CANCELLED";
    expiry_date: string;
  } | null;

  // Admin gate.
  if (pathname.startsWith(ADMIN_PREFIX) && profile?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Subscription gate for premium-only routes.
  const needsActiveSub = SUB_GATED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const subActive =
    sub?.status === "ACTIVE" &&
    sub?.expiry_date &&
    new Date(sub.expiry_date) > new Date();

  if (needsActiveSub && !subActive) {
    const redirect = new URL("/settings/subscription", request.url);
    redirect.searchParams.set("reason", "inactive");
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except Next internals and obvious static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
