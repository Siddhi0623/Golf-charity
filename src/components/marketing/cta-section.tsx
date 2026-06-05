import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-br from-slate-950 via-emerald-950/70 to-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(16,185,129,0.2),transparent)]" />

      <div className="container relative text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm text-emerald-300">
          <Heart className="h-3.5 w-3.5 fill-current" />
          Join 1,240+ members making a difference
        </div>

        <h2 className="text-3xl sm:text-5xl font-display font-bold text-white leading-tight tracking-tight">
          Ready to play for good?
        </h2>

        <p className="text-slate-300 text-lg max-w-md mx-auto">
          Your very first score could match the winning numbers. And no matter what — your charity
          gets funded every month.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="xl" asChild className="shadow-lg shadow-emerald-500/25">
            <Link href="/register">
              Start your membership
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="xl"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href="/charities">Browse charities</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
