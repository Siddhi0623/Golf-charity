import type { Metadata } from "next";
import { getCharities } from "@/server/queries/charities";
import { CharityCard } from "@/components/marketing/charity-card";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Charity Partners",
  description: "Browse all the charities supported by Fairway members.",
};

export default async function CharitiesPage() {
  const charities = await getCharities().catch(() => []);
  const featured = charities.filter((c) => c.isFeatured);
  const others = charities.filter((c) => !c.isFeatured);

  return (
    <div>
      {/* Page header */}
      <section className="bg-gradient-to-br from-muted/50 to-background border-b py-16 sm:py-20">
        <div className="container max-w-2xl text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Heart className="h-3 w-3 fill-current" />
            {charities.length} charity partners
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
            Choose your cause
          </h1>
          <p className="text-muted-foreground text-lg">
            Every Fairway member nominates a charity. A percentage of your subscription goes
            directly to the organisation you choose — every single month.
          </p>
        </div>
      </section>

      <div className="container py-16 space-y-16">
        {/* Featured section */}
        {featured.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Featured charities</h2>
              <span className="text-xs text-muted-foreground rounded-full bg-muted px-2.5 py-0.5">
                {featured.length}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((c) => (
                <CharityCard key={c.id} charity={c} />
              ))}
            </div>
          </div>
        )}

        {/* All others */}
        {others.length > 0 && (
          <div className="space-y-6">
            {featured.length > 0 && (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">All partners</h2>
                <span className="text-xs text-muted-foreground rounded-full bg-muted px-2.5 py-0.5">
                  {others.length}
                </span>
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((c) => (
                <CharityCard key={c.id} charity={c} />
              ))}
            </div>
          </div>
        )}

        {charities.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No charity partners yet. Check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
