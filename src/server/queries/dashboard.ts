import "server-only";
import { createClient } from "@/lib/supabase/server";

export type DashboardSub = {
  status: string;
  plan: string;
  expiryDate: string;
} | null;

export type DashboardScore = {
  id: string;
  score: number;
  playedAt: string;
  createdAt: string;
};

export type DashboardCharity = {
  charityId: string;
  charityName: string;
  contributionPct: number;
} | null;

export type DashboardDraw = {
  id: string;
  drawMonth: string;
  status: string;
  winningNumbers: number[] | null;
} | null;

export type DashboardData = {
  subscription: DashboardSub;
  scores: DashboardScore[];
  charity: DashboardCharity;
  latestDraw: DashboardDraw;
  totalWon: number;
  pendingWinnings: number;
};

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();

  const [subRes, scoresRes, ucRes, drawRes, winRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("status, plan, expiry_date")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .maybeSingle(),
    supabase
      .from("scores")
      .select("id, score, played_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_charities")
      .select("charity_id, contribution_pct")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("draws")
      .select("id, draw_month, status, winning_numbers")
      .order("draw_month", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("winners")
      .select("prize_amount, verification")
      .eq("user_id", userId),
  ]);

  type SubRow = { status: string; plan: string; expiry_date: string };
  type ScoreRow = { id: string; score: number; played_at: string; created_at: string };
  type UcRow = { charity_id: string; contribution_pct: number };
  type DrawRow = { id: string; draw_month: string; status: string; winning_numbers: number[] | null };
  type WinRow = { prize_amount: number; verification: string };

  const sub = subRes.data as SubRow | null;
  const scores = (scoresRes.data ?? []) as ScoreRow[];
  const uc = ucRes.data as UcRow | null;
  const draw = drawRes.data as DrawRow | null;
  const winnings = (winRes.data ?? []) as WinRow[];

  let charityName: string | null = null;
  if (uc?.charity_id) {
    const { data: charRaw } = await supabase
      .from("charities")
      .select("name")
      .eq("id", uc.charity_id)
      .maybeSingle();
    charityName = (charRaw as { name: string } | null)?.name ?? null;
  }

  return {
    subscription: sub
      ? { status: sub.status, plan: sub.plan, expiryDate: sub.expiry_date }
      : null,
    scores: scores.map((s) => ({
      id: s.id,
      score: s.score,
      playedAt: s.played_at,
      createdAt: s.created_at,
    })),
    charity:
      uc && charityName
        ? { charityId: uc.charity_id, charityName, contributionPct: uc.contribution_pct }
        : null,
    latestDraw: draw
      ? { id: draw.id, drawMonth: draw.draw_month, status: draw.status, winningNumbers: draw.winning_numbers }
      : null,
    totalWon: winnings
      .filter((w) => w.verification === "APPROVED")
      .reduce((a, w) => a + Number(w.prize_amount), 0),
    pendingWinnings: winnings
      .filter((w) => w.verification === "PENDING")
      .reduce((a, w) => a + Number(w.prize_amount), 0),
  };
}
