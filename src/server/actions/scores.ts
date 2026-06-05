"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { scoreCreateSchema, scoreUpdateSchema } from "@/lib/validations/score";

export async function addScore(data: { score: number; playedAt: string }) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = scoreCreateSchema.safeParse({ score: data.score, playedAt: data.playedAt });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("scores").insert({
    user_id: session.profile.id,
    score: parsed.data.score,
    played_at: parsed.data.playedAt,
  } as never);

  if (error) return { error: error.message };

  revalidatePath("/scores");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateScore(data: { id: string; score: number; playedAt: string }) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = scoreUpdateSchema.safeParse({ id: data.id, score: data.score, playedAt: data.playedAt });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("scores")
    .update({ score: parsed.data.score, played_at: parsed.data.playedAt } as never)
    .eq("id", parsed.data.id)
    .eq("user_id", session.profile.id); // RLS double-check

  if (error) return { error: error.message };

  revalidatePath("/scores");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteScore(id: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", id)
    .eq("user_id", session.profile.id);

  if (error) return { error: error.message };

  revalidatePath("/scores");
  revalidatePath("/dashboard");
  return { success: true };
}
