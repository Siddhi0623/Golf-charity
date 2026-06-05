import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

const SAMPLE_BALLS = [7, 14, 23, 31, 42];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-900 pt-20 pb-28 sm:pt-28 sm:pb-36">
      {/* Layered radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.25),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_60%,rgba(59,130,246,0.12),transparent)]" />

      {/* Decorative number balls — desktop only */}
      <div className="absolute right-6 top-12 hidden lg:flex flex-col gap-3 opacity-20 select-none">
        {SAMPLE_BALLS.map((n) => (
          <div
            key={n}
            className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-300 text-base font-bold"
          >
            {n}
          </div>
        ))}
      </div>

      <div className="container relative text-center max-w-4xl mx-auto px-4">
        {/* Pill badge */}
        <div className="mb-8 flex justify-center">
          <Badge
            variant="outline"
            className="gap-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-300 px-4 py-1.5 text-sm"
          >
            <Heart className="h-3.5 w-3.5 fill-current" />
            Every membership funds a charity you choose
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.1] tracking-tight mb-6">
          Your scores turn into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            something greater.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Subscribe monthly or yearly. Log your golf scores between 1–45. Each month, five
          numbers are drawn — match them and win real prizes, while your membership funds the
          charity you love.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="xl" asChild className="shadow-lg shadow-emerald-500/25">
            <Link href="/register">
              Start your membership
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="xl"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur"
            asChild
          >
            <Link href="/how-it-works">
              <Sparkles className="h-4 w-4" />
              How it works
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          From £9.99/month · No golf experience needed · Cancel anytime
        </p>

        {/* Draw numbers showcase */}
        <div className="mt-16 flex justify-center items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">This month&apos;s draw numbers:</span>
          {SAMPLE_BALLS.map((n) => (
            <div
              key={n}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-sm font-bold backdrop-blur"
            >
              {n}
            </div>
          ))}
          <span className="text-xs text-slate-500 ml-1">→ 3 winners this month</span>
        </div>
      </div>
    </section>
  );
}
