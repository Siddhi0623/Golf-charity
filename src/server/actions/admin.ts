"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/session";
import { generateWinningNumbers } from "@/lib/draw/generate";
import { charityUpsertSchema } from "@/lib/validations/charity";
import { drawCreateSchema } from "@/lib/validations/draw";
import type { DrawMode } from "@/types/domain";

// ─── Charity CRUD ────────────────────────────────────────────────────────────

export async function adminCreateCharity(data: unknown) {
  await requireRole("ADMIN");
  const parsed = charityUpsertSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = createAdminClient();
  const { upcoming_events, ...rest } = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description,
    cover_image_url: parsed.data.coverImageUrl ?? null,
    logo_url: parsed.data.logoUrl ?? null,
    website_url: parsed.data.websiteUrl ?? null,
    upcoming_events: parsed.data.upcomingEvents,
    is_featured: parsed.data.isFeatured,
    is_active: parsed.data.isActive,
  };
  const { error } = await supabase.from("charities").insert({ ...rest, upcoming_events });
  if (error) return { error: error.message };

  revalidatePath("/admin/charities");
  revalidatePath("/charities");
  return { success: true };
}

export async function adminUpdateCharity(id: string, data: unknown) {
  await requireRole("ADMIN");
  const parsed = charityUpsertSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("charities")
    .update({
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description,
      cover_image_url: parsed.data.coverImageUrl ?? null,
      logo_url: parsed.data.logoUrl ?? null,
      website_url: parsed.data.websiteUrl ?? null,
      upcoming_events: parsed.data.upcomingEvents,
      is_featured: parsed.data.isFeatured,
      is_active: parsed.data.isActive,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/charities");
  revalidatePath("/charities");
  return { success: true };
}

export async function adminDeleteCharity(id: string) {
  await requireRole("ADMIN");
  const supabase = createAdminClient();
  const { error } = await supabase.from("charities").update({ is_active: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/charities");
  revalidatePath("/charities");
  return { success: true };
}

// ─── Draw management ─────────────────────────────────────────────────────────

export async function adminCreateDraw(data: { drawMonth: string; mode: DrawMode }) {
  const session = await requireRole("ADMIN");
  const parsed = drawCreateSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("draws").insert({
    draw_month: parsed.data.drawMonth,
    mode: parsed.data.mode,
    status: "DRAFT",
    created_by: session.profile.id,
  } as never);

  if (error) {
    console.error("[adminCreateDraw] insert failed:", error);
    return { error: error.message };
  }
  revalidatePath("/admin/draws");
  return { success: true };
}

export async function adminSimulateDraw(drawId: string) {
  await requireRole("ADMIN");
  const supabase = createAdminClient();

  // Get draw to know mode
  const { data: drawRaw } = await supabase
    .from("draws")
    .select("mode, draw_month")
    .eq("id", drawId)
    .maybeSingle();
  const draw = drawRaw as { mode: string; draw_month: string } | null;
  if (!draw) return { error: "Draw not found" };

  let scoreHistory: number[] = [];
  if (draw.mode === "WEIGHTED") {
    // Fetch all scores entered during the draw month
    const monthStart = draw.draw_month;
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const { data: scoresRaw } = await supabase
      .from("scores")
      .select("score")
      .gte("created_at", monthStart)
      .lt("created_at", monthEnd.toISOString().slice(0, 10));
    scoreHistory = ((scoresRaw ?? []) as Array<{ score: number }>).map((s) => s.score);
  }

  const numbers = generateWinningNumbers({
    mode: draw.mode as DrawMode,
    scoreHistory,
  });

  // Save to draft draw
  const { error } = await supabase
    .from("draws")
    .update({ winning_numbers: numbers })
    .eq("id", drawId)
    .eq("status", "DRAFT");

  if (error) return { error: error.message };

  revalidatePath(`/admin/draws/${drawId}`);
  return { success: true, numbers };
}

export async function adminPublishDraw(drawId: string) {
  await requireRole("ADMIN");
  const supabase = createAdminClient();

  // Call the publish_draw PG function which computes winners
  const { error } = await supabase.rpc("publish_draw", { p_draw_id: drawId });
  if (error) return { error: error.message };

  revalidatePath("/admin/draws");
  revalidatePath("/draws");
  revalidatePath("/dashboard");
  return { success: true };
}

// ─── Winner verification ─────────────────────────────────────────────────────

export async function adminVerifyWinner(data: {
  winnerId: string;
  verification: "APPROVED" | "REJECTED";
  adminNotes?: string;
}) {
  const session = await requireRole("ADMIN");
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("winners")
    .update({
      verification: data.verification,
      verified_by: session.profile.id,
      verified_at: new Date().toISOString(),
    })
    .eq("id", data.winnerId);

  if (error) return { error: error.message };

  if (data.verification === "REJECTED" && data.adminNotes) {
    await supabase
      .from("payouts")
      .update({ admin_notes: data.adminNotes })
      .eq("winner_id", data.winnerId);
  }

  revalidatePath("/admin/winners");
  return { success: true };
}

export async function adminMarkPaid(winnerId: string) {
  await requireRole("ADMIN");
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("payouts")
    .update({ status: "PAID", paid_at: new Date().toISOString() })
    .eq("winner_id", winnerId);

  if (error) return { error: error.message };

  revalidatePath("/admin/winners");
  return { success: true };
}
