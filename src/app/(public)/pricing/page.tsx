import type { Metadata } from "next";
import { PricingSection } from "@/components/marketing/pricing-section";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Fairway. Monthly or yearly — everything included.",
};

const FAQ = [
  {
    q: "Can I cancel at any time?",
    a: "Yes. Cancel your subscription at any time from your account settings. Your access continues until the end of the billing period.",
  },
  {
    q: "What happens to my charity if I cancel?",
    a: "Your donation records are preserved. You can always re-subscribe and continue supporting the same charity.",
  },
  {
    q: "How is the prize pool calculated?",
    a: "The pool is the combined platform portion of all active subscriptions for the month (your membership minus your chosen charity contribution).",
  },
  {
    q: "What if there is no 5-match winner?",
    a: "The jackpot tier (40% of the pool) rolls over to the next month, growing the prize for future draws.",
  },
  {
    q: "Do I need to be a golfer?",
    a: "You can enter any integer score between 1 and 45 — no golf course required. The platform is about community and giving.",
  },
  {
    q: "When will Stripe payments be available?",
    a: "We are integrating Stripe for card payments. Until then, subscriptions are processed via our internal system with the same billing periods.",
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Pricing cards */}
      <PricingSection />

      {/* FAQ */}
      <section className="py-20 border-t">
        <div className="container max-w-2xl">
          <h2 className="text-2xl font-display font-bold tracking-tight text-center mb-10">
            Frequently asked questions
          </h2>
          <dl className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-border/60 bg-card p-6 space-y-2">
                <dt className="font-semibold text-sm">{item.q}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
