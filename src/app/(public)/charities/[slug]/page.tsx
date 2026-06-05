import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCharityBySlug, getAllCharitySlugs } from "@/server/queries/charities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, ExternalLink, Heart, MapPin } from "lucide-react";
import { formatDate } from "@/lib/format";

export async function generateStaticParams() {
  const slugs = await getAllCharitySlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const charity = await getCharityBySlug(slug).catch(() => null);
  if (!charity) return { title: "Charity not found" };
  return {
    title: charity.name,
    description: charity.description,
    openGraph: {
      title: charity.name,
      description: charity.description,
      images: charity.coverImageUrl ? [charity.coverImageUrl] : [],
    },
  };
}

export default async function CharityDetailPage(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const charity = await getCharityBySlug(slug).catch(() => null);
  if (!charity) notFound();

  return (
    <div>
      {/* Cover image */}
      <div className="relative h-56 sm:h-72 md:h-96 w-full overflow-hidden bg-muted">
        {charity.coverImageUrl ? (
          <Image
            src={charity.coverImageUrl}
            alt={charity.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          {charity.isFeatured && (
            <Badge className="mb-3 bg-amber-500/90 text-white border-0">Featured charity</Badge>
          )}
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-white">
            {charity.name}
          </h1>
        </div>
      </div>

      <div className="container max-w-4xl py-10 space-y-10">
        <Button variant="outline" size="sm" asChild>
          <Link href="/charities">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> All charities
          </Link>
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-start gap-4">
              {charity.logoUrl && (
                <div className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border bg-background shadow-sm">
                  <Image
                    src={charity.logoUrl}
                    alt={charity.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{charity.name}</h2>
                {charity.websiteUrl && (
                  <a
                    href={charity.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                  >
                    Visit website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">About this charity</h3>
              <p className="text-muted-foreground leading-relaxed">{charity.description}</p>
            </div>

            {charity.upcomingEvents.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Upcoming events</h3>
                <div className="space-y-3">
                  {charity.upcomingEvents.map((event, i) => (
                    <div key={i} className="card-elevated rounded-xl p-4">
                      <p className="font-medium">{event.title}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(event.date)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar CTA */}
          <aside className="space-y-4">
            <div className="card-elevated rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Heart className="h-5 w-5 fill-current" />
                <span className="font-semibold">Support this charity</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Subscribe to Fairway and select {charity.name} as your cause. A portion of your
                subscription is donated directly.
              </p>
              <Button asChild className="w-full">
                <Link href="/register">Join Fairway</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/settings/charity">Already a member? Select this charity</Link>
              </Button>
            </div>

            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">How it works</p>
              <p>
                You control what percentage of your subscription goes to charity — minimum 10%,
                up to 100%. The rest forms the monthly prize pool.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
