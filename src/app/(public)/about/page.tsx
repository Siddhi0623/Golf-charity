import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Target, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About Fairway",
  description: "Our mission: make giving feel effortless by turning everyday activity into meaningful impact.",
};

const VALUES = [
  {
    icon: Heart,
    title: "Charity first, always",
    desc: "Every product decision starts with the question: does this make it easier to give? Charities are never an afterthought — they are the entire point.",
  },
  {
    icon: Target,
    title: "Radical transparency",
    desc: "We publish every draw result, every contribution total, and every prize paid out. You always know exactly where your money goes.",
  },
  {
    icon: Users,
    title: "Community over competition",
    desc: "The draw isn't zero-sum. When one member wins, the charity pot still lands. We built this so everyone wins in some way.",
  },
  {
    icon: Zap,
    title: "Frictionless generosity",
    desc: "Giving shouldn't feel like a transaction. We've made it a habit — automatic, joyful, and tied to something you already do.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-muted/50 to-background border-b py-20 sm:py-28">
        <div className="container max-w-3xl text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight">
            Play with purpose.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Fairway was built on a simple idea: what if a small monthly subscription could do two
            remarkable things at once — fund a charity you believe in, and give you a genuine
            shot at winning meaningful prizes?
          </p>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We believe generosity shouldn&apos;t be a big decision. It should be a standing order — quiet,
            consistent, and compounding over time into real change.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container max-w-3xl space-y-6">
          <h2 className="text-2xl font-display font-bold tracking-tight">Our mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            To make habitual giving the norm — not the exception. We use the excitement of a
            monthly prize draw as the mechanism that keeps members engaged, but the charity
            funding is unconditional. Even in months with no winners, every active member&apos;s
            contribution still reaches their chosen cause.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We are independent, not-for-profit in spirit, and focused entirely on the charities
            and communities we serve.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30 border-y">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-display font-bold tracking-tight text-center mb-12">
            What we stand for
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center space-y-4">
          <h2 className="text-2xl font-display font-bold">Become part of the story</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Every member who joins adds to the monthly donation total and grows the prize pool
            for everyone.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Start your membership</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
