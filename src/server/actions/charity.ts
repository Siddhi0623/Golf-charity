"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { userCharitySelectSchema } from "@/lib/validations/charity";

export async function selectCharity(data: { charityId: string; contributionPct: number }) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const parsed = userCharitySelectSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = await createClient();

  // Upsert user_charities (1:1 row, user_id is the PK)
  const { error } = await supabase.from("user_charities").upsert(
    {
      user_id: session.profile.id,
      charity_id: parsed.data.charityId,
      contribution_pct: parsed.data.contributionPct,
    } as never,
    { onConflict: "user_id" },
  );

  if (error) return { error: error.message };

  revalidatePath("/settings/charity");
  revalidatePath("/dashboard");
  return { success: true };
}
