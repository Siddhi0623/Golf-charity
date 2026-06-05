import "server-only";
import { createClient } from "@/lib/supabase/server";

export type DrawListItem = {
  id: string;
  drawMonth: string;
  mode: string;
  status: string;
  winningNumbers: number[] | null;
  poolTotal: number;
  jackpotCarryIn: number;
  publishedAt: string | null;
};

export type DrawWithUserMatch = DrawListItem & {
  userMatchCount: "THREE" | "FOUR" | "FIVE" | null;
  userPrize: number | null;
  userScores: number[];
};

export async function getPublishedDraws(): Promise<DrawListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("draws")
    .select("id, draw_month, mode, status, winning_numbers, pool_total, jackpot_carry_in, published_at")
    .eq("status", "PUBLISHED")
    .order("draw_month", { ascending: false })
    .limit(24);

  if (error) throw error;
  return ((data ?? []) as Array<{
    id: string; draw_month: string; mode: string; status: string;
    winning_numbers: number[] | null; pool_total: number;
    jackpot_carry_in: number; published_at: string | null;
  }>).map((d) => ({
    id: d.id,
    drawMonth: d.draw_month,
    mode: d.mode,
    status: d.status,
    winningNumbers: d.winning_numbers,
    poolTotal: Number(d.pool_total),
    jackpotCarryIn: Number(d.jackpot_carry_in),
    publishedAt: d.published_at,
  }));
}

export async function getAllDraws(): Promise<DrawListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("draws")
    .select("id, draw_month, mode, status, winning_numbers, pool_total, jackpot_carry_in, published_at")
    .order("draw_month", { ascending: false })
    .limit(36);

  if (error) throw error;
  return ((data ?? []) as Array<{
    id: string; draw_month: string; mode: string; status: string;
    winning_numbers: number[] | null; pool_total: number;
    jackpot_carry_in: number; published_at: string | null;
  }>).map((d) => ({
    id: d.id, drawMonth: d.draw_month, mode: d.mode, status: d.status,
    winningNumbers: d.winning_numbers, poolTotal: Number(d.pool_total),
    jackpotCarryIn: Number(d.jackpot_carry_in), publishedAt: d.published_at,
  }));
}

export async function getDrawById(id: string): Promise<DrawListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("draws")
    .select("id, draw_month, mode, status, winning_numbers, pool_total, jackpot_carry_in, published_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const d = data as {
    id: string; draw_month: string; mode: string; status: string;
    winning_numbers: number[] | null; pool_total: number;
    jackpot_carry_in: number; published_at: string | null;
  };
  return { id: d.id, drawMonth: d.draw_month, mode: d.mode, status: d.status,
    winningNumbers: d.winning_numbers, poolTotal: Number(d.pool_total),
    jackpotCarryIn: Number(d.jackpot_carry_in), publishedAt: d.published_at };
}

export async function getUserDrawEntry(userId: string, drawId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("winners")
    .select("id, match_count, prize_amount, verification")
    .eq("user_id", userId)
    .eq("draw_id", drawId)
    .maybeSingle();
  return data as { id: string; match_count: string; prize_amount: number; verification: string } | null;
}

export async function getUserScores(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scores")
    .select("id, score, played_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  return (data ?? []) as Array<{ id: string; score: number; played_at: string; created_at: string }>;
}
