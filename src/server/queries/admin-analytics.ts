import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminStats = {
  totalUsers: number;
  activeSubscribers: number;
  totalDonations: number;
  totalPrizePool: number;
  totalPrizesPaid: number;
};

export type MonthlyRevenuePoint = {
  month: string;
  revenue: number;
  donations: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createAdminClient();

  const [usersRes, subsRes, payoutsRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("price, contribution_pct, status"),
    supabase
      .from("payouts")
      .select("amount, status"),
  ]);

  const allSubs = (subsRes.data ?? []) as Array<{ price: number; contribution_pct: number | null; status: string }>;
  const activeSubs = allSubs.filter((s) => s.status === "ACTIVE");

  const totalDonations = allSubs.reduce(
    (acc, s) => acc + Number(s.price) * ((s.contribution_pct ?? 10) / 100),
    0,
  );
  const totalPrizePool = allSubs.reduce(
    (acc, s) => acc + Number(s.price) * (1 - (s.contribution_pct ?? 10) / 100),
    0,
  );

  const payouts = (payoutsRes.data ?? []) as Array<{ amount: number; status: string }>;
  const totalPrizesPaid = payouts
    .filter((p) => p.status === "PAID")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  return {
    totalUsers: usersRes.count ?? 0,
    activeSubscribers: activeSubs.length,
    totalDonations: Math.round(totalDonations * 100) / 100,
    totalPrizePool: Math.round(totalPrizePool * 100) / 100,
    totalPrizesPaid: Math.round(totalPrizesPaid * 100) / 100,
  };
}

export async function getRecentSubscriptions(limit = 50) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("id, user_id, plan, status, price, contribution_pct, start_date, expiry_date")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Array<{
    id: string; user_id: string; plan: string; status: string;
    price: number; contribution_pct: number | null;
    start_date: string; expiry_date: string;
  }>;
}

export async function getAllUsers(limit = 100) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Array<{
    id: string; email: string; full_name: string | null;
    role: "USER" | "ADMIN"; created_at: string;
  }>;
}

export async function getAllWinnersAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("winners")
    .select("id, draw_id, user_id, match_count, prize_amount, verification, proof_url, proof_notes, verified_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Array<{
    id: string; draw_id: string; user_id: string;
    match_count: string; prize_amount: number;
    verification: string; proof_url: string | null;
    proof_notes: string | null; verified_at: string | null;
  }>;
}
