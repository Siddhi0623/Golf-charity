import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: { default: "Sign in", template: "%s · Fairway" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal header */}
      <header className="h-16 flex items-center px-6 border-b">
        <Logo />
      </header>

      {/* Background gradient */}
      <div className="flex-1 relative flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/40">
        <div className="absolute inset-0 -z-10 bg-hero-radial opacity-30" />
        {children}
      </div>

      {/* Footer note */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        By continuing you agree to our{" "}
        <Link href="#" className="underline underline-offset-2 hover:text-foreground">
          Terms
        </Link>{" "}
        &{" "}
        <Link href="#" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </footer>
    </div>
  );
}
