"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";
import { getPaymentProvider } from "@/lib/subscription/provider";
import { computeExpiry, PLAN_PRICE } from "@/lib/subscription/lifecycle";
import type { SubPlan } from "@/types/domain";

export async function startCheckout(plan: SubPlan) {
  const session = await getSession();
  if (!session) redirect("/login");

  const provider = getPaymentProvider();
  const price = PLAN_PRICE[plan];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { paymentId } = await provider.startCheckout({
    userId: session.profile.id,
    email: session.profile.email,
    plan,
    amount: price,
    successUrl: `${appUrl}/settings/subscription?success=1`,
    cancelUrl: `${appUrl}/settings/subscription?cancelled=1`,
  });

  // For mock: write subscription directly.
  const supabase = createAdminClient();
  const expiry = computeExpiry(plan);

  // Cancel any existing active sub first.
  await supabase
    .from("subscriptions")
    .update({ status: "CANCELLED", cancelled_at: new Date().toISOString() })
    .eq("user_id", session.profile.id)
    .eq("status", "ACTIVE");

  const { error } = await supabase.from("subscriptions").insert({
    user_id: session.profile.id,
    plan,
    status: "ACTIVE",
    price,
    expiry_date: expiry.toISOString(),
    mock_payment_id: paymentId,
  });

  if (error) return { error: error.message };

  revalidatePath("/settings/subscription");
  revalidatePath("/dashboard");
  redirect("/settings/subscription?success=1");
}

export async function cancelSubscription() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "CANCELLED", cancelled_at: new Date().toISOString() } as never)
    .eq("user_id", session.profile.id)
    .eq("status", "ACTIVE");

  if (error) return { error: error.message };

  revalidatePath("/settings/subscription");
  revalidatePath("/dashboard");
  return { success: true };
}
