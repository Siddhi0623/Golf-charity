import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CreditCard, Target, Trophy, Heart,
  ArrowRight, AlertCircle, CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate, formatMonth, daysUntilExpiry } from "@/lib/format";
import type { DashboardData } from "@/server/queries/dashboard";

interface OverviewCardsProps {
  data: DashboardData;
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const { subscription, scores, charity, latestDraw, totalWon, pendingWinnings } = data;

  const daysLeft = subscription ? daysUntilExpiry(subscription.expiryDate) : null;
  const subStatusBadge = subscription
    ? daysLeft !== null && daysLeft <= 7
      ? { label: `Expires in ${daysLeft}d`, variant: "warning" as const }
      : { label: "Active", variant: "success" as const }
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-6">
      {/* Subscription */}
      <StatCard
        title="Subscription"
        icon={CreditCard}
        iconColor="text-blue-500"
        iconBg="bg-blue-50 dark:bg-blue-950/30"
        href="/settings/subscription"
      >
        {subscription ? (
          <>
            <p className="text-2xl font-bold capitalize">{subscription.plan.toLowerCase()}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={subStatusBadge?.variant ?? "success"} className="text-xs">
                {subStatusBadge?.label}
              </Badge>
            </div>
            {daysLeft !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                Expires {formatDate(subscription.expiryDate)}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-lg font-medium text-muted-foreground">No active plan</p>
            <Button size="sm" asChild className="mt-2">
              <Link href="/settings/subscription">Subscribe now</Link>
            </Button>
          </>
        )}
      </StatCard>

      {/* Scores / Draw entries */}
      <StatCard
        title="Score Entries"
        icon={Target}
        iconColor="text-emerald-500"
        iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        href="/scores"
      >
        <p className="text-2xl font-bold">{scores.length} <span className="text-sm font-normal text-muted-foreground">/ 5</span></p>
        <p className="text-xs text-muted-foreground mt-1">
          {scores.length === 0
            ? "No scores yet — add your first"
            : `Latest: ${scores[0]?.score ?? "—"} on ${formatDate(scores[0]?.playedAt ?? "")}`}
        </p>
        {latestDraw && (
          <p className="text-xs mt-1">
            <span className={latestDraw.status === "PUBLISHED" ? "text-emerald-600" : "text-amber-600"}>
              {latestDraw.status === "PUBLISHED" ? "Latest draw published" : "Draw coming up"}
            </span>{" "}
            · {formatMonth(latestDraw.drawMonth)}
          </p>
        )}
      </StatCard>

      {/* Winnings */}
      <StatCard
        title="Total Won"
        icon={Trophy}
        iconColor="text-amber-500"
        iconBg="bg-amber-50 dark:bg-amber-950/30"
        href="/winnings"
      >
        <p className="text-2xl font-bold">{formatCurrency(totalWon)}</p>
        {pendingWinnings > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {formatCurrency(pendingWinnings)} pending verification
          </p>
        )}
        {totalWon === 0 && pendingWinnings === 0 && (
          <p className="text-xs text-muted-foreground mt-1">Keep entering scores!</p>
        )}
      </StatCard>

      {/* Charity */}
      <StatCard
        title="Your Charity"
        icon={Heart}
        iconColor="text-rose-500"
        iconBg="bg-rose-50 dark:bg-rose-950/30"
        href="/settings/charity"
      >
        {charity ? (
          <>
            <p className="text-base font-semibold leading-tight">{charity.charityName}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              {charity.contributionPct}% of your subscription donated
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">No charity selected</p>
            <Button size="sm" variant="outline" asChild className="mt-2">
              <Link href="/settings/charity">Pick a charity</Link>
            </Button>
          </>
        )}
      </StatCard>
    </div>
  );
}

function StatCard({
  title, icon: Icon, iconColor, iconBg, href, children,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-elevated rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
        </div>
        <Link
          href={href}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
        >
          Manage <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
        {children}
      </div>
    </div>
  );
}
