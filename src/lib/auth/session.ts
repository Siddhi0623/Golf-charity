import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/domain";

/**
 * Cached per-request session getter. Safe to call multiple times in the same
 * request — only one round-trip to Supabase per render pass.
 */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  // Explicit cast: supabase-js v2 column-select inference returns `never`
  // when the Database type is a placeholder (pre-supabase gen types run).
  const profile = profileRaw as {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: "USER" | "ADMIN";
  } | null;

  if (!profile) return null;

  const p: Profile = {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    role: profile.role,
  };
  return { user, profile: p };
});

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(role: UserRole) {
  const session = await requireUser();
  if (session.profile.role !== role) redirect("/dashboard");
  return session;
}
