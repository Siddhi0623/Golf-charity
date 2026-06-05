import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getPublishedDraws } from "@/server/queries/draws";
import { getUserScores } from "@/server/queries/draws";
import { PageHeader } from "@/components/dashboard/page-header";
import { NumberBallRow } from "@/components/draws/number-ball";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMonth } from "@/lib/format";
import { classifyMatches } from "@/lib/draw/match";
import { MATCH_LABEL } from "@/lib/constants";
import { ArrowRight, Dices } from "lucide-react";
import type { MatchCount } from "@/types/domain";

export const metadata: Metadata = { title: "Draws" };

export default async function DrawsPage() {
  const session = await getSession();
  if (!session) return null;

  const [draws, scores] = await Promise.all([
    getPublishedDraws().catch(() => []),
    getUserScores(session.profile.id).catch(() => []),
  ]);

  const userScoreValues = scores.map((s) => s.score);
  const userScoreSet = new Set(userScoreValues);

  return (
    <div>
      <PageHeader
        title="Draws"
        description="Published monthly draws — your scores are compared against the winning numbers"
      />

      <div className="p-6 space-y-4">
        {draws.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-16 text-center space-y-3">
            <Dices className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="font-medium">No draws published yet</p>
            <p className="text-sm text-muted-foreground">
              The first draw will appear here once the admin publishes the monthly results.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {draws.map((draw) => {
              const matched = draw.winningNumbers
                ? draw.winningNumbers.filter((n) => userScoreSet.has(n))
                : [];
              const matchCount: MatchCount | null =
                matched.length >= 5 ? "FIVE" :
                matched.length === 4 ? "FOUR" :
                matched.length >= 3 ? "THREE" : null;

              return (
                <div key={draw.id} className="card-elevated rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{formatMonth(draw.drawMonth)}</p>
                        <Badge variant="success" className="text-xs">Published</Badge>
                        {matchCount && (
                          <Badge variant="warning" className="text-xs gap-1">
                            🏆 {MATCH_LABEL[matchCount]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Prize pool: {formatCurrency(draw.poolTotal + draw.jackpotCarryIn)}
                        {draw.jackpotCarryIn > 0 && (
                          <span className="text-amber-500 ml-1">
                            (includes {formatCurrency(draw.jackpotCarryIn)} jackpot carry)
                          </span>
                        )}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/draws/${draw.id}`}>
                        View detail <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>

                  {draw.winningNumbers && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Winning numbers</p>
                      <NumberBallRow
                        numbers={draw.winningNumbers}
                        size="md"
                        variant="winner"
                        matchedNumbers={userScoreSet}
                        gap="gap-2"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
