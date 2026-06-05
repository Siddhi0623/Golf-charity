"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, ChevronDown, LayoutDashboard, Settings, LogOut, ShieldCheck, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/domain";

const NAV_LINKS = [
  { href: "/charities", label: "Charities" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

export function Nav() {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setProfile(null); return; }

      const { data: rawData } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      // Explicit cast: supabase-js v2 column-select inference produces `never`
      // until `npm run db:types` is run against a real project.
      const data = rawData as {
        id: string; email: string; full_name: string | null;
        avatar_url: string | null; role: "USER" | "ADMIN";
      } | null;

      setProfile(
        data
          ? { id: data.id, email: data.email, fullName: data.full_name, avatarUrl: data.avatar_url, role: data.role }
          : null,
      );
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setProfile(null);
      else fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  };

  const initials = profile
    ? (profile.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ?? profile.email[0]?.toUpperCase() ?? "U")
    : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Logo />

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg transition-colors",
                  pathname.startsWith(link.href)
                    ? "text-foreground font-medium bg-accent/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-1">
          <ThemeToggle />

          {profile === undefined ? (
            /* Loading skeleton */
            <div className="h-8 w-28 rounded-lg bg-muted animate-pulse" />
          ) : profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 pl-2 pr-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.fullName ?? ""} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium leading-none">
                    {profile.fullName?.split(" ")[0] ?? "Account"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-medium text-sm text-foreground">
                    {profile.fullName ?? "Member"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/scores">
                    <Target className="mr-2 h-4 w-4" />
                    My Scores
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/winnings">
                    <Trophy className="mr-2 h-4 w-4" />
                    Winnings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {profile.role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="text-primary font-medium">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl">
          <div className="container py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t mt-3">
              {profile ? (
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2.5 text-sm rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2.5 text-sm rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link href="/register">Get started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
