import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CharityCard } from "./charity-card";
import { ArrowRight, Heart } from "lucide-react";
import type { Charity } from "@/types/domain";

interface FeaturedCharitiesProps {
  charities: Charity[];
}

export function FeaturedCharities({ charities }: FeaturedCharitiesProps) {
  if (!charities.length) return null;

  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest">
              Charity partners
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              Pick the cause that moves you
            </h2>
            <p className="text-muted-foreground max-w-md">
              Every active member nominates a charity. Your monthly contribution goes directly to
              the organisation you choose.
            </p>
          </div>

          <Button variant="outline" className="shrink-0 gap-2" asChild>
            <Link href="/charities">
              <Heart className="h-4 w-4" />
              View all charities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {charities.map((charity) => (
            <CharityCard key={charity.id} charity={charity} />
          ))}
        </div>
      </div>
    </section>
  );
}
