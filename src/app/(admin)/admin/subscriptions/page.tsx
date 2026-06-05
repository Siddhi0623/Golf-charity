import type { Metadata } from "next";
import { getRecentSubscriptions } from "@/server/queries/admin-analytics";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Subscriptions · Admin" };
export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, "success" | "destructive" | "secondary"> = {
  ACTIVE: "success",
  EXPIRED: "destructive",
  CANCELLED: "secondary",
};

export default async function AdminSubscriptionsPage() {
  const subs = await getRecentSubscriptions(100).catch(() => []);

  const active = subs.filter((s) => s.status === "ACTIVE").length;
  const expired = subs.filter((s) => s.status === "EXPIRED").length;
  const cancelled = subs.filter((s) => s.status === "CANCELLED").length;

  return (
    <div>
      <PageHeader title="Subscriptions" description="All subscription records" />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active", value: active, variant: "success" as const },
            { label: "Expired", value: expired, variant: "destructive" as const },
            { label: "Cancelled", value: cancelled, variant: "secondary" as const },
          ].map((c) => (
            <div key={c.label} className="card-elevated rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold">{c.value}</p>
              <Badge variant={c.variant} className="text-xs mt-1">{c.label}</Badge>
            </div>
          ))}
        </div>

        {subs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No subscriptions yet.</p>
        ) : (
          <div className="card-elevated rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Donation %</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {s.plan.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[s.status] ?? "secondary"} className="text-xs">
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(Number(s.price))}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.contribution_pct != null ? `${s.contribution_pct}%` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(s.start_date)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(s.expiry_date)}
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
