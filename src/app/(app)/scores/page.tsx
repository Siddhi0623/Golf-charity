import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getUserScores } from "@/server/queries/draws";
import { ScoreTable } from "@/components/dashboard/score-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { DRAW_COUNT, DRAW_MIN, DRAW_MAX } from "@/lib/draw/generate";

export const metadata: Metadata = { title: "My Scores" };

export default async function ScoresPage() {
  const session = await getSession();
  if (!session) return null;

  const raw = await getUserScores(session.profile.id).catch(() => []);
  const scores = raw.map((s) => ({
    id: s.id, score: s.score,
    playedAt: s.played_at,
    createdAt: s.created_at,
  }));

  return (
    <div>
      <PageHeader
        title="My Scores"
        description={`Enter scores between ${DRAW_MIN}–${DRAW_MAX}. Your ${DRAW_COUNT} most recent scores are used in each monthly draw.`}
      />

      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            {scores.length} / {DRAW_COUNT} slots used
          </Badge>
          {scores.length >= DRAW_COUNT && (
            <span className="text-amber-600 dark:text-amber-400 text-xs">
              Adding a new score will remove the oldest one.
            </span>
          )}
        </div>
      </div>

      <ScoreTable initialScores={scores} />
    </div>
  );
}
