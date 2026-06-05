import type { Metadata } from "next";
import { Nav } from "@/components/shared/nav";
import { Footer } from "@/components/shared/footer";
import { Hero } from "@/components/marketing/hero";
import { StatsBar } from "@/components/marketing/stats-bar";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { FeaturedCharities } from "@/components/marketing/featured-charities";
import { PricingSection } from "@/components/marketing/pricing-section";
import { CTASection } from "@/components/marketing/cta-section";
import { getFeaturedCharities } from "@/server/queries/charities";

export const metadata: Metadata = {
  title: "Fairway — Play with purpose",
  description:
    "Subscribe monthly or yearly. Log your golf scores. Win prizes every month while funding the charity you love.",
};

export default async function HomePage() {
  // Fault-tolerant fetch: returns empty array when Supabase isn't configured.
  const featuredCharities = await getFeaturedCharities(3).catch(() => []);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorksSection />
        <FeaturedCharities charities={featuredCharities} />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
