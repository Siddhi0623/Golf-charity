import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, href = "/", size = "md" }: LogoProps) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 font-display font-bold", sizes[size], className)}
    >
      {/* Brand mark: stylised "F" in an emerald circle */}
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm">
        F
      </span>
      <span className="text-foreground tracking-tight">Fairway</span>
    </Link>
  );
}
