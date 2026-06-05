/**
 * Jackpot carry-over: when a draw has no 5-match winner the 5-tier portion
 * rolls into the next month's draw as jackpot_carry_in.
 *
 * This module exposes a single helper that finds the most recent published
 * draw and returns its carry_out to seed the next draft.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export async function getPendingJackpotCarry(
  supabase: SupabaseClient<Database>,
  beforeMonth: Date,
): Promise<number> {
  const monthStart = new Date(beforeMonth.getFullYear(), beforeMonth.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const { data: rawData, error } = await supabase
    .from("draws")
    .select("jackpot_carry_out, draw_month")
    .eq("status", "PUBLISHED")
    .lt("draw_month", monthStart)
    .order("draw_month", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  // Explicit cast for supabase-js v2 column-select inference.
  const data = rawData as { jackpot_carry_out: number | null } | null;
  return data?.jackpot_carry_out ? Number(data.jackpot_carry_out) : 0;
}
