import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { getUserWinnings } from "@/server/queries/winnings";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatMonth, matchCountLabel } from "@/lib/format";
import { Trophy } from "lucide-react";

export const metadata: Metadata = { title: "Winnings" };

const VERIFY_BADGE: Record<string, { label: string; variant: "default" | "success" | "destructive" | "warning" | "secondary" }> = {
  PENDING: { label: "Pending review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

const PAYOUT_BADGE: Record<string, { label: string; variant: "success" | "secondary" }> = {
  PAID: { label: "Paid", variant: "success" },
  PENDING: { label: "Awaiting payout", variant: "secondary" },
};

export default async function WinningsPage() {
  const session = await getSession();
  if (!session) return null;

  const winnings = await getUserWinnings(session.profile.id).catch(() => []);

  const totalApproved = winnings
    .filter((w) => w.verification === "APPROVED")
    .reduce((a, w) => a + w.prizeAmount, 0);

  const totalPaid = winnings
    .filter((w) => w.payoutStatus === "PAID")
    .reduce((a, w) => a + w.prizeAmount, 0);

  const totalPending = winnings
    .filter((w) => w.verification === "PENDING")
    .reduce((a, w) => a + w.prizeAmount, 0);

  return (
    <div>
      <PageHeader title="Winnings" description="Your prize history across all draws" />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total won", value: formatCurrency(totalApproved), sub: "approved prizes", color: "text-emerald-600" },
            { label: "Total paid out", value: formatCurrency(totalPaid), sub: "received", color: "text-blue-600" },
            { label: "Pending", value: formatCurrency(totalPending), sub: "awaiting verification", color: "text-amber-600" },
          ].map((c) => (
            <div key={c.label} className="card-elevated rounded-2xl p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{c.label}</p>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Winnings table */}
        {winnings.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-16 text-center space-y-3">
            <Trophy className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="font-medium">No winnings yet</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Keep entering scores every month — the more you enter, the better your chances.
            </p>
          </div>
        ) : (
          <div className="card-elevated rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Draw</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Prize</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Payout</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winnings.map((w) => {
                  const vb = VERIFY_BADGE[w.verification] ?? { label: w.verification, variant: "secondary" as const };
                  const pb = w.payoutStatus ? (PAYOUT_BADGE[w.payoutStatus] ?? { label: w.payoutStatus, variant: "secondary" as const }) : null;
                  return (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{formatMonth(w.drawMonth)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {matchCountLabel(w.matchCount)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(w.prizeAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={vb.variant} className="text-xs">{vb.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {pb ? (
                          <Badge variant={pb.variant} className="text-xs">{pb.label}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
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
