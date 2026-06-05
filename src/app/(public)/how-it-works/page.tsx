import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { ArrowRight, Dices, Split, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "How it works",
  description: "Learn how Fairway subscriptions, score entries, monthly draws, and charity contributions all work together.",
};

const DRAW_TIERS = [
  { match: "5 Match", label: "Jackpot", pct: 40, color: "from-amber-500/20 to-orange-500/10", border: "border-amber-400/40", textColor: "text-amber-600 dark:text-amber-400" },
  { match: "4 Match", label: "Big prize", pct: 35, color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-400/40", textColor: "text-emerald-600 dark:text-emerald-400" },
  { match: "3 Match", label: "Prize", pct: 25, color: "from-blue-500/20 to-indigo-500/10", border: "border-blue-400/40", textColor: "text-blue-600 dark:text-blue-400" },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-muted/50 to-background border-b py-16 sm:py-20">
        <div className="container max-w-2xl text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            How Fairway works
          </h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about subscriptions, score entry, the monthly draw,
            and how your charity receives its contribution.
          </p>
        </div>
      </section>

      {/* How it works steps */}
      <HowItWorksSection />

      {/* The draw explained */}
      <section className="py-20 border-t bg-muted/20">
        <div className="container max-w-3xl space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
              <Dices className="h-3 w-3" />
              Monthly draw
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              How the draw works
            </h2>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              On the last day of every month, our admin team runs the draw. Five unique winning
              numbers between 1 and 45 are selected — either by pure random draw, or using a
              weighted algorithm that reflects the frequency of scores entered that month.
            </p>
            <p>
              We compare each member&apos;s five most recent scores against the winning numbers.
              If you have entered a score that matches one of the five winners, that counts as
              a match. You can match 3, 4, or all 5 numbers to win.
            </p>
            <p>
              Duplicate scores in your history are de-duplicated — if you entered 23 twice, it
              counts as one match, not two.
            </p>
          </div>

          {/* Prize tiers */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Split className="h-4 w-4 text-primary" />
              Prize pool allocation
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {DRAW_TIERS.map((t) => (
                <div
                  key={t.match}
                  className={`rounded-2xl border ${t.border} bg-gradient-to-br ${t.color} p-5 text-center space-y-1`}
                >
                  <p className={`text-2xl font-display font-bold ${t.textColor}`}>{t.pct}%</p>
                  <p className="font-semibold text-sm">{t.match}</p>
                  <p className="text-xs text-muted-foreground">{t.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              If multiple members win the same tier, the tier prize is split equally. If no member
              wins the 5-match jackpot, that 40% rolls over to the next month&apos;s pool.
            </p>
          </div>
        </div>
      </section>

      {/* Score rules */}
      <section className="py-20 border-t">
        <div className="container max-w-3xl space-y-8">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-display font-bold">Score entry rules</h2>
          </div>
          <ul className="space-y-3">
            {[
              "Scores must be whole numbers between 1 and 45 (the same range as the draw numbers).",
              "We keep your 5 most recent scores. When you enter a 6th, the oldest is removed automatically.",
              "Your score history is locked to entries from your active subscription period.",
              "Scores can be edited at any time before the monthly draw closes.",
              "You need at least one score on file to appear in the draw comparison.",
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Badge variant="outline" className="shrink-0 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </Badge>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t bg-muted/30">
        <div className="container text-center space-y-4">
          <h2 className="text-2xl font-display font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">
            It takes two minutes to set up your membership.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Start your membership
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
