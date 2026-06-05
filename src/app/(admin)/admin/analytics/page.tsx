"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/format";
import { Loader2 } from "lucide-react";

type MonthBucket = { month: string; revenue: number; donations: number; members: number };

function buildMonthlyBuckets(
  subs: Array<{ start_date: string; price: number; contribution_pct: number | null }>,
): MonthBucket[] {
  const map = new Map<string, MonthBucket>();

  for (const s of subs) {
    const m = s.start_date.slice(0, 7); // "YYYY-MM"
    const label = new Date(s.start_date + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    if (!map.has(m)) map.set(m, { month: label, revenue: 0, donations: 0, members: 0 });
    const b = map.get(m)!;
    const price = Number(s.price);
    const pct = s.contribution_pct ?? 10;
    b.revenue += price;
    b.donations += price * (pct / 100);
    b.members += 1;
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([, v]) => v);
}

export default function AdminAnalyticsPage() {
  const [buckets, setBuckets] = useState<MonthBucket[]>([]);
  const [totals, setTotals] = useState({ revenue: 0, donations: 0, members: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("subscriptions")
      .select("start_date, price, contribution_pct")
      .then(({ data }) => {
        const rows = (data ?? []) as Array<{ start_date: string; price: number; contribution_pct: number | null }>;
        const b = buildMonthlyBuckets(rows);
        setBuckets(b);
        setTotals({
          revenue: b.reduce((a, r) => a + r.revenue, 0),
          donations: b.reduce((a, r) => a + r.donations, 0),
          members: b.reduce((a, r) => a + r.members, 0),
        });
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center gap-2 p-8 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics…
    </div>
  );

  return (
    <div>
      <div className="border-b bg-background px-6 py-4">
        <h1 className="text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Revenue, donations and member growth (last 12 months)</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total revenue", value: formatCurrency(totals.revenue) },
            { label: "Total donated", value: formatCurrency(totals.donations) },
            { label: "New subscriptions", value: totals.members.toLocaleString() },
          ].map((c) => (
            <div key={c.label} className="card-elevated rounded-2xl p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{c.label}</p>
              <p className="text-2xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue & Donations chart */}
        <div className="card-elevated rounded-2xl p-6">
          <h2 className="font-semibold mb-6">Monthly revenue vs donations</h2>
          {buckets.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No subscription data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={buckets} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickFormatter={(v) => `£${v}`} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="donations" name="Donations" stroke="#3b82f6" fill="url(#colorDonations)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* New members chart */}
        <div className="card-elevated rounded-2xl p-6">
          <h2 className="font-semibold mb-6">New subscriptions per month</h2>
          {buckets.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={buckets} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }}
                />
                <Bar dataKey="members" name="New subscriptions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
