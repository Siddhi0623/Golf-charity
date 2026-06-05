import { CreditCard, Target, Trophy } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: CreditCard,
    title: "Subscribe & pick your charity",
    description:
      "Choose a monthly (£9.99) or yearly (£99) plan. Select one of our charity partners and set how much of your membership you'd like to donate — minimum 10%.",
    color: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/30",
  },
  {
    step: "02",
    icon: Target,
    title: "Log your golf scores",
    description:
      "Enter scores between 1 and 45 whenever you play. We keep your 5 most recent scores — the newest entry replaces the oldest, keeping things fresh every month.",
    color: "from-blue-500/20 to-indigo-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/30",
  },
  {
    step: "03",
    icon: Trophy,
    title: "Win prizes, fund causes",
    description:
      "Each month 5 winning numbers are drawn from 1–45. Match 3, 4, or all 5 to win a share of the prize pool. No match? Your charity donation still lands. Everyone gives, everyone has a chance.",
    color: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/30",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-4">
            Simple. Meaningful. Monthly.
          </h2>
          <p className="text-muted-foreground text-lg">
            Three steps is all it takes to turn your golf into a force for good.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.step}
              className={`relative rounded-2xl border ${s.borderColor} bg-gradient-to-br ${s.color} p-8 space-y-4 overflow-hidden`}
            >
              {/* Big step number */}
              <span className="absolute -top-4 -right-2 text-9xl font-display font-black text-foreground/5 select-none leading-none">
                {s.step}
              </span>

              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${s.borderColor} bg-background/80 ${s.iconColor}`}>
                <s.icon className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
