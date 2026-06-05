import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Server-side Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads/writes auth cookies via next/headers.
 *
 * Returns a typed SupabaseClient<Database> so mutations (insert/update/etc.)
 * are fully type-checked without the overload-resolution quirks of the SSR
 * wrapper's generics.
 */
export async function createClient() {
  const cookieStore = await cookies();

  // Build the cookie-aware SSR client (untyped internally so generic inference
  // stays clean), then cast it to the typed interface.
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware handles refresh.
          }
        },
      },
    },
  );

  // Re-cast to Database-typed client so all table operations are correctly typed.
  return client as unknown as ReturnType<typeof createSupabaseClient<Database>>;
}
