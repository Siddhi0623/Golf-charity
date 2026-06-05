"use client";

import { useTransition, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, CreditCard, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { startCheckout, cancelSubscription } from "@/server/actions/subscription";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatCurrency } from "@/lib/format";
import { daysUntilExpiry } from "@/lib/subscription/lifecycle";
import { PLAN_PRICE } from "@/lib/constants";

type Sub = { status: string; plan: string; expiry_date: string; price: number } | null;

const FEATURES = [
  "Monthly prize draw entries",
  "Score history (5 latest)",
  "Choose your charity",
  "Win 3-, 4- or 5-match prizes",
  "Contribution history",
];

export default function SubscriptionPage() {
  const [sub, setSub] = useState<Sub>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success")) toast.success("Subscription activated! Welcome aboard.");
    if (searchParams.get("cancelled")) toast.info("Checkout cancelled.");
  }, [searchParams]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("subscriptions")
        .select("status, plan, expiry_date, price")
        .eq("user_id", user.id)
        .eq("status", "ACTIVE")
        .maybeSingle();
      setSub(data as Sub);
      setLoading(false);
    });
  }, []);

  const handleSubscribe = (plan: "MONTHLY" | "YEARLY") => {
    startTransition(async () => {
      await startCheckout(plan);
    });
  };

  const handleCancel = () => {
    if (!confirm("Cancel your subscription? You'll retain access until the expiry date.")) return;
    startTransition(async () => {
      const result = await cancelSubscription();
      if (result?.error) toast.error(result.error);
      else { toast.success("Subscription cancelled."); setSub(null); }
    });
  };

  const daysLeft = sub ? daysUntilExpiry(sub.expiry_date) : null;

  return (
    <div>
      <div className="border-b bg-background px-6 py-4">
        <h1 className="text-xl font-semibold">Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your plan and billing</p>
      </div>

      <div className="p-6 max-w-2xl space-y-8">
        {/* Current plan */}
        {!loading && sub && (
          <div className="card-elevated rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold">Current plan</h2>
                </div>
                <p className="text-2xl font-bold capitalize">{sub.plan.toLowerCase()} plan</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {formatCurrency(sub.price)}{sub.plan === "MONTHLY" ? "/month" : "/year"}
                </p>
              </div>
              <Badge variant={daysLeft !== null && daysLeft <= 7 ? "warning" : "success"}>
                Active · {daysLeft}d left
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Expires {formatDate(sub.expiry_date)}
            </div>

            <Separator />

            <div className="flex gap-3">
              {sub.plan === "MONTHLY" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubscribe("YEARLY")}
                  disabled={isPending}
                >
                  Upgrade to Yearly (save 17%)
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleCancel}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel subscription"}
              </Button>
            </div>
          </div>
        )}

        {/* Plan cards */}
        {!loading && !sub && (
          <div className="space-y-4">
            <h2 className="font-semibold">Choose a plan</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {(["MONTHLY", "YEARLY"] as const).map((plan) => (
                <div
                  key={plan}
                  className={`rounded-2xl border-2 p-6 space-y-4 ${plan === "YEARLY" ? "border-primary" : "border-border"}`}
                >
                  {plan === "YEARLY" && (
                    <Badge className="bg-primary text-primary-foreground gap-1 mb-1">
                      <Zap className="h-3 w-3" /> Best value — Save 17%
                    </Badge>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground capitalize">{plan.toLowerCase()}</p>
                    <p className="text-3xl font-bold mt-1">
                      {formatCurrency(PLAN_PRICE[plan])}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan === "MONTHLY" ? "month" : "year"}
                      </span>
                    </p>
                    {plan === "YEARLY" && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        That's just {formatCurrency(PLAN_PRICE.YEARLY / 12)}/month
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan === "YEARLY" ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan)}
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Subscribe ${plan.toLowerCase()}`}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
