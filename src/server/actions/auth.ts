"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ─── Sign In ─────────────────────────────────────────────────────────────────
export async function signIn(data: { email: string; password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────
export async function signUp(data: {
  email: string;
  password: string;
  fullName: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { full_name: data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  return {
    success: true,
    message: "Account created! Check your email to confirm before signing in.",
  };
}

// ─── Sign Out ────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ─── Forgot Password ─────────────────────────────────────────────────────────
export async function forgotPassword(data: { email: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/settings/profile`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

// ─── Update Password ─────────────────────────────────────────────────────────
export async function updatePassword(data: { password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) return { error: error.message };
  return { success: true };
}
