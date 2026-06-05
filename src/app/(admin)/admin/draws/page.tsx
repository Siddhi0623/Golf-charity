"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { adminCreateDraw } from "@/server/actions/admin";
import { formatMonth, formatDate } from "@/lib/format";
import { NumberBallRow } from "@/components/draws/number-ball";

type DrawRow = {
  id: string; draw_month: string; mode: string;
  status: string; winning_numbers: number[] | null;
  pool_total: number; published_at: string | null;
};

const STATUS_BADGE: Record<string, "secondary" | "success"> = {
  DRAFT: "secondary", PUBLISHED: "success",
};

function getNextMonthISO() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 7) + "-01";
}

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<DrawRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"RANDOM" | "WEIGHTED">("RANDOM");
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("draws")
      .select("id, draw_month, mode, status, winning_numbers, pool_total, published_at")
      .order("draw_month", { ascending: false })
      .limit(36);
    setDraws((data ?? []) as DrawRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = () => {
    startTransition(async () => {
      const result = await adminCreateDraw({ drawMonth: getNextMonthISO(), mode });
      if (result?.error) toast.error(result.error);
      else { toast.success("Draw created"); load(); }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b bg-background px-6 py-4 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Draws</h1>
          <p className="text-sm text-muted-foreground">Create, simulate and publish monthly draws</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={mode} onValueChange={(v) => setMode(v as "RANDOM" | "WEIGHTED")}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RANDOM">Random</SelectItem>
              <SelectItem value="WEIGHTED">Weighted</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleCreate} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
            Create draw
          </Button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : draws.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center space-y-3">
            <p className="text-2xl">🎲</p>
            <p className="font-medium">No draws yet</p>
            <p className="text-sm text-muted-foreground">Create your first monthly draw above.</p>
          </div>
        ) : (
          <div className="card-elevated rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Winning Numbers</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {draws.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{formatMonth(d.draw_month)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {d.mode.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[d.status] ?? "secondary"} className="text-xs">
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {d.winning_numbers ? (
                        <NumberBallRow
                          numbers={d.winning_numbers}
                          size="sm"
                          variant={d.status === "PUBLISHED" ? "winner" : "default"}
                          gap="gap-1"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">Not simulated</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.published_at ? formatDate(d.published_at) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
                        <Link href={`/admin/draws/${d.id}`}>
                          Open <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
