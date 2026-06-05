import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getDrawById, getUserDrawEntry, getUserScores } from "@/server/queries/draws";
import { PageHeader } from "@/components/dashboard/page-header";
import { NumberBall, NumberBallRow } from "@/components/draws/number-ball";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatMonth, formatDate, matchCountLabel } from "@/lib/format";
import { ArrowLeft, Trophy } from "lucide-react";
import { PRIZE_SPLIT } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const draw = await getDrawById(id).catch(() => null);
  if (!draw) return { title: "Draw not found" };
  return { title: `${formatMonth(draw.drawMonth)} Draw` };
}

export default async function DrawDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session) return null;

  const [draw, scores] = await Promise.all([
    getDrawById(id).catch(() => null),
    getUserScores(session.profile.id).catch(() => []),
  ]);

  if (!draw || draw.status !== "PUBLISHED") notFound();

  const userEntry = await getUserDrawEntry(session.profile.id, id).catch(() => null);
  const userScoreValues = scores.map((s) => s.score);
  const winSet = new Set(draw.winningNumbers ?? []);
  const matchedScores = userScoreValues.filter((s) => winSet.has(s));

  return (
    <div>
      <PageHeader
        title={`${formatMonth(draw.drawMonth)} Draw`}
        description={`Published draw results${draw.publishedAt ? ` · ${formatDate(draw.publishedAt)}` : ""}`}
      />

      <div className="p-6 space-y-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/draws"><ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> All draws</Link>
        </Button>

        {/* Winning numbers */}
        <section className="card-elevated rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Winning numbers</h2>
            <Badge variant="success">Published</Badge>
          </div>
          {draw.winningNumbers ? (
            <NumberBallRow
              numbers={draw.winningNumbers}
              size="xl"
              variant="winner"
              gap="gap-3"
            />
          ) : (
            <p className="text-muted-foreground text-sm">Numbers not available</p>
          )}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {(["FIVE", "FOUR", "THREE"] as const).map((tier) => (
              <div key={tier} className="rounded-xl bg-muted/50 p-3 text-center space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  {tier === "FIVE" ? "5 match" : tier === "FOUR" ? "4 match" : "3 match"}
                </p>
                <p className="font-semibold text-sm">
                  {formatCurrency((draw.poolTotal + draw.jackpotCarryIn) * PRIZE_SPLIT[tier])}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {Math.round(PRIZE_SPLIT[tier] * 100)}% of pool
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* User result */}
        <section className="card-elevated rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">Your result</h2>
          {userScoreValues.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You had no scores on file for this draw.
            </p>
          ) : (
            <>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Your scores</p>
                <div className="flex flex-wrap gap-2">
                  {userScoreValues.map((s, i) => (
                    <NumberBall
                      key={i}
                      number={s}
                      size="md"
                      variant={winSet.has(s) ? "matched" : "user"}
                    />
                  ))}
                </div>
              </div>

              {matchedScores.length > 0 ? (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-4 flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {userEntry
                        ? matchCountLabel(userEntry.match_count as "THREE" | "FOUR" | "FIVE")
                        : `${matchedScores.length} match${matchedScores.length > 1 ? "es" : ""}`}
                    </p>
                    {userEntry && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Prize: {formatCurrency(Number(userEntry.prize_amount))} · {userEntry.verification}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">No matches this draw. Keep entering scores!</p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Pool info */}
        <section className="card-elevated rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold text-sm">Prize pool details</h2>
          <dl className="space-y-1.5 text-sm">
            {(
              [
                ["Mode", draw.mode],
                ["Pool total", formatCurrency(draw.poolTotal)],
                ...(draw.jackpotCarryIn > 0
                  ? [["Jackpot carry-in", formatCurrency(draw.jackpotCarryIn)] as [string, string]]
                  : []),
                ["Total available", formatCurrency(draw.poolTotal + draw.jackpotCarryIn)],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
