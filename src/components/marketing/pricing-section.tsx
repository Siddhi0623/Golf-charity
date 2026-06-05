"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FEATURES = [
  "Monthly prize draw entries",
  "Score history (5 latest)",
  "Choose your charity",
  "Win 3-, 4- or 5-match prizes",
  "Contribution history",
  "Winner announcements",
];

const YEARLY_SAVING_PCT = Math.round((1 - 99 / (9.99 * 12)) * 100);

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="py-24 sm:py-32">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg">
            One plan, two billing options. Everything included.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={cn("text-sm", !yearly ? "font-medium" : "text-muted-foreground")}>
              Monthly
            </span>
            <button
              role="switch"
              aria-checked={yearly}
              onClick={() => setYearly(!yearly)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-colors",
                yearly ? "bg-primary" : "bg-input",
              )}
            >
              <span
                className={cn(
                  "block h-5 w-5 rounded-full bg-background shadow-lg transition-transform",
                  yearly ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
            <span className={cn("text-sm flex items-center gap-1.5", yearly ? "font-medium" : "text-muted-foreground")}>
              Yearly
              <Badge variant="success" className="text-xs px-1.5 py-0.5">
                Save {YEARLY_SAVING_PCT}%
              </Badge>
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="mx-auto max-w-sm">
          <div className="relative rounded-3xl border-2 border-primary bg-card p-8 shadow-[0_0_0_4px_rgba(16,185,129,0.08),0_24px_48px_-12px_rgba(16,185,129,0.15)]">
            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground gap-1 px-3 shadow-sm">
                <Zap className="h-3 w-3" />
                Most popular
              </Badge>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-display font-bold">
                  £{yearly ? "99" : "9.99"}
                </span>
                <span className="text-muted-foreground pb-2">/{yearly ? "year" : "month"}</span>
              </div>
              {yearly && (
                <p className="text-sm text-muted-foreground mt-1">
                  That&apos;s just £8.25/month — you save £{(9.99 * 12 - 99).toFixed(2)}
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button size="lg" className="w-full" asChild>
              <Link href="/register">
                Get started — {yearly ? "£99/yr" : "£9.99/mo"}
              </Link>
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              No commitment · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
