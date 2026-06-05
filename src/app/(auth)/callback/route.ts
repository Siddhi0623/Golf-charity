import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback handler for:
 *  - Email confirmation links
 *  - Password reset links
 *  - OAuth redirect (when Google is enabled)
 *
 * Supabase appends `?code=...` to the redirectTo URL. We exchange it for a
 * session and redirect the user to their destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Surface Supabase auth errors (e.g. expired confirmation link).
  if (error) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", errorDescription ?? error);
    return NextResponse.redirect(url.toString());
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Successful auth — redirect to intended destination.
      const redirectTo = next.startsWith("/") ? `${origin}${next}` : next;
      return NextResponse.redirect(redirectTo);
    }

    const url = new URL("/login", origin);
    url.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(url.toString());
  }

  // No code — redirect to login.
  return NextResponse.redirect(new URL("/login", origin).toString());
}
