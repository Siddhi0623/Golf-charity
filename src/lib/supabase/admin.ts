import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Server-only Supabase client using the SERVICE_ROLE key. RLS is bypassed.
 *
 * Use this ONLY for:
 *  - admin operations that need to break out of RLS (e.g. publish_draw RPC,
 *    cross-user reads in admin analytics, payment webhooks)
 *  - the promote-admin bootstrap script
 *
 * NEVER import this from a Client Component. The `server-only` import will
 * throw at build time if you do.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "createAdminClient: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
