import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/server/queries/admin-analytics";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatCurrency } from "@/lib/format";
import {
  Users, CreditCard, Heart, Trophy, DollarSign,
  ArrowRight, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Admin Overview" };
export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  { href: "/admin/draws", label: "Manage Draws", desc: "Create, simulate & publish monthly draws", icon: "🎲" },
  { href: "/admin/winners", label: "Review Winners", desc: "Approve proofs and mark payouts", icon: "🏆" },
  { href: "/admin/charities", label: "Manage Charities", desc: "Add, edit and feature charities", icon: "❤️" },
  { href: "/admin/analytics", label: "Full Analytics", desc: "Revenue, donations & draw stats", icon: "📊" },
];

export default async function AdminOverviewPage() {
  const stats = await getAdminStats().catch(() => ({
    totalUsers: 0, activeSubscribers: 0,
    totalDonations: 0, totalPrizePool: 0, totalPrizesPaid: 0,
  }));

  const cards = [
    { label: "Total members", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Active subscribers", value: stats.activeSubscribers.toLocaleString(), icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { label: "Total donated", value: formatCurrency(stats.totalDonations), icon: Heart, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
    { label: "Prize pool (total)", value: formatCurrency(stats.totalPrizePool), icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { label: "Prizes paid out", value: formatCurrency(stats.totalPrizesPaid), icon: Trophy, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
    {
      label: "Conversion rate",
      value: stats.totalUsers > 0 ? `${Math.round((stats.activeSubscribers / stats.totalUsers) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
    },
  ];

  return (
    <div>
      <PageHeader title="Admin Overview" description="Platform health at a glance" />

      <div className="p-6 space-y-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="card-elevated rounded-2xl p-5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl mb-4 ${c.bg}`}>
                <c.icon className={`h-4.5 w-4.5 ${c.color}`} />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p>
              <p className="text-2xl font-bold mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Quick actions
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="card-elevated rounded-2xl p-5 flex items-center gap-4 hover:border-primary/40 transition-all group"
              >
                <span className="text-2xl">{l.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{l.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
