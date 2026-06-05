"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, DollarSign, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { adminVerifyWinner, adminMarkPaid } from "@/server/actions/admin";
import { formatCurrency, matchCountLabel } from "@/lib/format";

type WinnerRow = {
  id: string; draw_id: string; user_id: string;
  match_count: string; prize_amount: number;
  verification: string; proof_url: string | null;
};

type PayoutRow = { winner_id: string; status: string };

const VERIFY_BADGE: Record<string, "warning" | "success" | "destructive"> = {
  PENDING: "warning", APPROVED: "success", REJECTED: "destructive",
};

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<WinnerRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const load = async () => {
    const supabase = createClient();
    const [wRes, pRes] = await Promise.all([
      supabase.from("winners")
        .select("id, draw_id, user_id, match_count, prize_amount, verification, proof_url")
        .order("created_at", { ascending: false }),
      supabase.from("payouts").select("winner_id, status"),
    ]);
    setWinners((wRes.data ?? []) as WinnerRow[]);
    setPayouts((pRes.data ?? []) as PayoutRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const payoutMap = new Map(payouts.map((p) => [p.winner_id, p.status]));

  const handleVerify = (id: string, v: "APPROVED" | "REJECTED") => {
    setPendingId(id);
    startTransition(async () => {
      const result = await adminVerifyWinner({ winnerId: id, verification: v });
      if (result?.error) toast.error(result.error);
      else { toast.success(`Winner ${v.toLowerCase()}`); load(); }
      setPendingId(null);
    });
  };

  const handleMarkPaid = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const result = await adminMarkPaid(id);
      if (result?.error) toast.error(result.error);
      else { toast.success("Marked as paid"); load(); }
      setPendingId(null);
    });
  };

  const pending = winners.filter((w) => w.verification === "PENDING").length;
  const approved = winners.filter((w) => w.verification === "APPROVED").length;

  return (
    <div>
      <div className="border-b bg-background px-6 py-4">
        <h1 className="text-xl font-semibold">Winners</h1>
        <p className="text-sm text-muted-foreground">
          {pending} pending review · {approved} approved
        </p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : winners.length === 0 ? (
          <p className="text-muted-foreground text-sm">No winners yet.</p>
        ) : (
          <div className="card-elevated rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Prize</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="w-40" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.map((w) => {
                  const isPending = pendingId === w.id;
                  const payoutStatus = payoutMap.get(w.id);
                  return (
                    <TableRow key={w.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {matchCountLabel(w.match_count as "THREE" | "FOUR" | "FIVE")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(Number(w.prize_amount))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={VERIFY_BADGE[w.verification] ?? "secondary"} className="text-xs">
                          {w.verification}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payoutStatus ? (
                          <Badge variant={payoutStatus === "PAID" ? "success" : "secondary"} className="text-xs">
                            {payoutStatus}
                          </Badge>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>
                      <TableCell>
                        {w.proof_url ? (
                          <a href={w.proof_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : <span className="text-muted-foreground text-xs">None</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 justify-end flex-wrap">
                          {w.verification === "PENDING" && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => handleVerify(w.id, "APPROVED")} disabled={isPending}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => handleVerify(w.id, "REJECTED")} disabled={isPending}>
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          )}
                          {w.verification === "APPROVED" && payoutStatus === "PENDING" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleMarkPaid(w.id)} disabled={isPending}>
                              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <DollarSign className="h-3.5 w-3.5" />}
                              Mark paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
