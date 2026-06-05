import "server-only";
import { createClient } from "@/lib/supabase/server";

export type WinningRow = {
  id: string;
  drawId: string;
  drawMonth: string;
  matchCount: "THREE" | "FOUR" | "FIVE";
  prizeAmount: number;
  verification: "PENDING" | "APPROVED" | "REJECTED";
  proofUrl: string | null;
  proofNotes: string | null;
  payoutStatus: "PENDING" | "PAID" | null;
  paidAt: string | null;
};

export async function getUserWinnings(userId: string): Promise<WinningRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("winners")
    .select("id, draw_id, match_count, prize_amount, verification, proof_url, proof_notes")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const winnerRows = (data ?? []) as Array<{
    id: string; draw_id: string; match_count: string; prize_amount: number;
    verification: string; proof_url: string | null; proof_notes: string | null;
  }>;

  if (!winnerRows.length) return [];

  // Fetch draw months and payouts in parallel
  const drawIds = [...new Set(winnerRows.map((w) => w.draw_id))];
  const winnerIds = winnerRows.map((w) => w.id);

  const [drawsRes, payoutsRes] = await Promise.all([
    supabase.from("draws").select("id, draw_month").in("id", drawIds),
    supabase.from("payouts").select("winner_id, status, paid_at").in("winner_id", winnerIds),
  ]);

  const drawMap = new Map(
    ((drawsRes.data ?? []) as Array<{ id: string; draw_month: string }>)
      .map((d) => [d.id, d.draw_month]),
  );
  const payoutMap = new Map(
    ((payoutsRes.data ?? []) as Array<{ winner_id: string; status: string; paid_at: string | null }>)
      .map((p) => [p.winner_id, p]),
  );

  return winnerRows.map((w) => ({
    id: w.id,
    drawId: w.draw_id,
    drawMonth: drawMap.get(w.draw_id) ?? w.draw_id,
    matchCount: w.match_count as "THREE" | "FOUR" | "FIVE",
    prizeAmount: Number(w.prize_amount),
    verification: w.verification as "PENDING" | "APPROVED" | "REJECTED",
    proofUrl: w.proof_url,
    proofNotes: w.proof_notes,
    payoutStatus: (payoutMap.get(w.id)?.status as "PENDING" | "PAID" | null) ?? null,
    paidAt: payoutMap.get(w.id)?.paid_at ?? null,
  }));
}
