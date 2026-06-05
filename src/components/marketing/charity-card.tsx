import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Charity } from "@/types/domain";

interface CharityCardProps {
  charity: Charity;
  className?: string;
}

export function CharityCard({ charity, className }: CharityCardProps) {
  return (
    <div
      className={cn(
        "group rounded-2xl overflow-hidden border border-border/60 bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_24px_-8px_rgba(16,24,40,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_40px_-8px_rgba(16,185,129,0.2)]",
        className,
      )}
    >
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {charity.coverImageUrl ? (
          <Image
            src={charity.coverImageUrl}
            alt={charity.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-teal-950" />
        )}

        {/* Featured badge */}
        {charity.isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-amber-500/90 text-white border-0 gap-1 text-xs shadow">
              <Star className="h-3 w-3 fill-current" />
              Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          {charity.logoUrl && (
            <div className="relative shrink-0 h-10 w-10 overflow-hidden rounded-xl border bg-background shadow-sm">
              <Image
                src={charity.logoUrl}
                alt={`${charity.name} logo`}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          )}

          <div className="min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate">{charity.name}</h3>
            {charity.websiteUrl && (
              <a
                href={charity.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5"
              >
                <ExternalLink className="h-3 w-3" />
                Website
              </a>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {charity.description}
        </p>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/charities/${charity.slug}`}>Learn more</Link>
        </Button>
      </div>
    </div>
  );
}
