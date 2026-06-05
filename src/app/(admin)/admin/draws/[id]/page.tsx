"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2, ArrowLeft, RefreshCcw, Megaphone, Dices,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { NumberBallRow } from "@/components/draws/number-ball";
import { adminSimulateDraw, adminPublishDraw } from "@/server/actions/admin";
import { createClient } from "@/lib/supabase/client";
import { formatMonth, formatDate, formatCurrency } from "@/lib/format";

type DrawDetail = {
  id: string; draw_month: string; mode: string; status: string;
  winning_numbers: number[] | null; pool_total: number;
  jackpot_carry_in: number; published_at: string | null;
};

export default function AdminDrawDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [draw, setDraw] = useState<DrawDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [numbers, setNumbers] = useState<number[] | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [, startTransition] = useTransition();

  const loadDraw = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("draws")
      .select("id, draw_month, mode, status, winning_numbers, pool_total, jackpot_carry_in, published_at")
      .eq("id", id)
      .maybeSingle();
    const d = data as DrawDetail | null;
    setDraw(d);
    setNumbers(d?.winning_numbers ?? null);
    setLoading(false);
  };

  useEffect(() => { loadDraw(); }, [id]);

  const handleSimulate = () => {
    setSimulating(true);
    startTransition(async () => {
      const result = await adminSimulateDraw(id);
      if (result?.error) toast.error(result.error);
      else if (result?.numbers) {
        setNumbers(result.numbers);
        toast.success("Numbers simulated — review then publish");
      }
      setSimulating(false);
    });
  };

  const handlePublish = () => {
    if (!numbers) { toast.error("Simulate numbers first"); return; }
    if (!confirm("Publish this draw? This will compute winners and cannot be undone.")) return;
    setPublishing(true);
    startTransition(async () => {
      const result = await adminPublishDraw(id);
      if (result?.error) toast.error(result.error);
      else { toast.success("Draw published! Winners have been computed."); router.push("/admin/draws"); }
      setPublishing(false);
    });
  };

  if (loading) return (
    <div className="flex items-center gap-2 p-8 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading draw…
    </div>
  );

  if (!draw) return (
    <div className="p-8 text-muted-foreground">Draw not found.</div>
  );

  const isPublished = draw.status === "PUBLISHED";
  const pool = Number(draw.pool_total) + Number(draw.jackpot_carry_in);

  return (
    <div>
      <div className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
              <Link href="/admin/draws"><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Draws</Link>
            </Button>
          </div>
          <h1 className="text-xl font-semibold">{formatMonth(draw.draw_month)}</h1>
          <p className="text-sm text-muted-foreground">
            {isPublished ? `Published ${formatDate(draw.published_at!)}` : "Draft — not yet published"}
          </p>
        </div>
        <Badge variant={isPublished ? "success" : "secondary"}>{draw.status}</Badge>
      </div>

      <div className="p-6 space-y-6 max-w-2xl">
        {/* Draw numbers */}
        <section className="card-elevated rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Dices className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Winning numbers</h2>
          </div>

          {numbers ? (
            <NumberBallRow
              numbers={numbers}
              size="xl"
              variant={isPublished ? "winner" : "default"}
              gap="gap-3"
            />
          ) : (
            <div className="rounded-xl border border-dashed p-8 text-center space-y-2">
              <p className="text-muted-foreground text-sm">No numbers yet</p>
              <p className="text-xs text-muted-foreground">Click Simulate to generate the draw numbers</p>
            </div>
          )}

          {!isPublished && (
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={handleSimulate}
                disabled={simulating || publishing}
              >
                {simulating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Simulating…</>
                ) : (
                  <><RefreshCcw className="h-4 w-4 mr-2" /> {numbers ? "Re-simulate" : "Simulate numbers"}</>
                )}
              </Button>

              {numbers && (
                <Button onClick={handlePublish} disabled={simulating || publishing}>
                  {publishing ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Publishing…</>
                  ) : (
                    <><Megaphone className="h-4 w-4 mr-2" /> Publish draw</>
                  )}
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Pool details */}
        <section className="card-elevated rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold text-sm">Prize pool</h2>
          <dl className="space-y-1.5 text-sm">
            {(
              [
                ["Mode", draw.mode],
                ["Pool total", formatCurrency(Number(draw.pool_total))],
                ...(Number(draw.jackpot_carry_in) > 0
                  ? [["Jackpot carry-in", formatCurrency(Number(draw.jackpot_carry_in))] as [string, string]]
                  : []),
                ["Total available", formatCurrency(pool)],
                ["5 match (40%)", formatCurrency(pool * 0.4)],
                ["4 match (35%)", formatCurrency(pool * 0.35)],
                ["3 match (25%)", formatCurrency(pool * 0.25)],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Mode explanation */}
        {!isPublished && (
          <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-1">
            <p className="font-medium">Mode: {draw.mode}</p>
            <p className="text-muted-foreground">
              {draw.mode === "WEIGHTED"
                ? "Numbers are weighted by how frequently users have entered them as scores this month — popular scores are more likely to be drawn."
                : "Numbers are drawn completely at random from 1–45 with equal probability."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
