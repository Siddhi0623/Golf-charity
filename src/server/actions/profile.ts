"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "At least 2 characters").max(80),
});

export async function updateProfile(data: { fullName: string }) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = profileUpdateSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName } as never)
    .eq("id", session.profile.id);

  if (error) return { error: error.message };

  // Also update auth metadata
  await supabase.auth.updateUser({ data: { full_name: parsed.data.fullName } });

  revalidatePath("/settings/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
