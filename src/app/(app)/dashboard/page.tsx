import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getDashboardData } from "@/server/queries/dashboard";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { PageHeader } from "@/components/dashboard/page-header";
import { NumberBallRow } from "@/components/draws/number-ball";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dices, Target } from "lucide-react";
import Link from "next/link";
import { formatMonth, formatDate } from "@/lib/format";
import { MATCH_LABEL } from "@/lib/constants";
import type { MatchCount } from "@/types/domain";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const data = await getDashboardData(session.profile.id).catch(() => ({
    subscription: null, scores: [], charity: null,
    latestDraw: null, totalWon: 0, pendingWinnings: 0,
  }));

  const { scores, latestDraw } = data;

  return (
    <div>
      <PageHeader
        title={`Good to see you, ${session.profile.fullName?.split(" ")[0] ?? "there"} 👋`}
        description="Here's what's happening with your account"
      />

      {/* Overview cards */}
      <OverviewCards data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 pb-6">
        {/* My scores */}
        <section className="card-elevated rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">My scores</h2>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/scores" className="text-xs">
                Manage <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="p-5">
            {scores.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-muted-foreground">No scores yet</p>
                <Button size="sm" asChild>
                  <Link href="/scores">Add your first score</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <NumberBallRow
                  numbers={scores.map((s) => s.score)}
                  size="md"
                  variant="user"
                  gap="gap-2.5"
                />
                <ul className="space-y-1 mt-3">
                  {scores.map((s, i) => (
                    <li key={s.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-6 text-center">{s.score}</span>
                        {i === 0 && (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">Latest</Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground text-xs">{formatDate(s.playedAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Latest draw */}
        <section className="card-elevated rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <Dices className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-sm">Latest draw</h2>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <Link href="/draws" className="text-xs">
                All draws <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="p-5">
            {!latestDraw ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No draws yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The first draw will appear here once published.
                </p>
              </div>
            ) : latestDraw.status === "PUBLISHED" && latestDraw.winningNumbers ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {formatMonth(latestDraw.drawMonth)} — winning numbers
                  </p>
                  <NumberBallRow
                    numbers={latestDraw.winningNumbers}
                    size="md"
                    variant="winner"
                    matchedNumbers={new Set(scores.map((s) => s.score))}
                    gap="gap-2.5"
                  />
                </div>
                {scores.length > 0 && (
                  <div className="rounded-xl bg-muted/50 p-3 text-sm">
                    <p className="font-medium text-xs mb-1">Your matches</p>
                    {(() => {
                      const userSet = new Set(scores.map((s) => s.score));
                      const matched = latestDraw.winningNumbers.filter((n) => userSet.has(n));
                      if (matched.length === 0)
                        return <p className="text-muted-foreground text-xs">No matches this draw. Keep entering scores!</p>;
                      const mc: MatchCount | null =
                        matched.length >= 5 ? "FIVE" :
                        matched.length === 4 ? "FOUR" :
                        matched.length === 3 ? "THREE" : null;
                      return (
                        <p className="text-primary font-semibold">
                          {mc ? MATCH_LABEL[mc] : `${matched.length} match${matched.length > 1 ? "es" : ""}`}
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-1">
                <p className="text-sm font-medium">Draw in progress</p>
                <p className="text-xs text-muted-foreground">
                  {formatMonth(latestDraw.drawMonth)} draw will be published soon.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
