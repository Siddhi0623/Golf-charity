"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Target, Dices, Trophy, Heart, CreditCard,
  User, ShieldCheck, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { daysUntilExpiry } from "@/lib/subscription/lifecycle";
import type { Profile } from "@/types/domain";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { items: NavItem[] };

const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scores", label: "My Scores", icon: Target },
  { href: "/draws", label: "Draws", icon: Dices },
  { href: "/winnings", label: "Winnings", icon: Trophy },
];

const SETTINGS_NAV: NavItem[] = [
  { href: "/settings/charity", label: "My Charity", icon: Heart },
  { href: "/settings/subscription", label: "Subscription", icon: CreditCard },
  { href: "/settings/profile", label: "Profile", icon: User },
];

interface AppSidebarProps {
  profile: Profile;
  subscription: { status: string; plan: string; expiryDate: string } | null;
}

export function AppSidebar({ profile, subscription }: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const initials = (profile.fullName ?? profile.email)
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const daysLeft = subscription ? daysUntilExpiry(subscription.expiryDate) : null;
  const subBadge = subscription
    ? daysLeft !== null && daysLeft <= 7
      ? { label: `${daysLeft}d left`, variant: "destructive" as const }
      : { label: subscription.plan === "YEARLY" ? "Yearly" : "Monthly", variant: "success" as const }
    : { label: "No plan", variant: "secondary" as const };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center px-4 border-b">
        <Logo size="sm" href="/dashboard" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {MAIN_NAV.map((item) => (
          <SidebarLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} />
        ))}

        <Separator className="my-3" />

        <p className="px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          Account
        </p>
        {SETTINGS_NAV.map((item) => (
          <SidebarLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        {profile.role === "ADMIN" && (
          <>
            <Separator className="my-3" />
            <SidebarLink
              item={{ href: "/admin", label: "Admin Panel", icon: ShieldCheck }}
              active={pathname.startsWith("/admin")}
              highlight
            />
          </>
        )}
      </nav>

      {/* Subscription status */}
      {subscription && (
        <div className="px-4 py-2 border-t">
          <div className="rounded-xl bg-muted/60 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Subscription</span>
              <Badge variant={subBadge.variant} className="text-[10px] px-1.5 py-0">
                {subBadge.label}
              </Badge>
            </div>
            {daysLeft !== null && (
              <p className="text-xs text-muted-foreground">{daysLeft} days remaining</p>
            )}
          </div>
        </div>
      )}

      {/* User footer */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-2.5 rounded-xl hover:bg-muted/60 p-2 group cursor-pointer">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={profile.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">{profile.fullName ?? "Member"}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{profile.email}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ThemeToggle />
            <Button
              variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-background">
        <SidebarContent />
      </aside>

      {/* Mobile: top bar + drawer */}
      <div className="md:hidden">
        <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur px-4">
          <Logo size="sm" href="/dashboard" />
          <button
            className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-muted/50"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <div className="h-14" /> {/* spacer */}

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative z-10 w-72 bg-background border-r h-full flex flex-col animate-fade-in">
              <div className="flex h-14 items-center justify-between px-4 border-b">
                <Logo size="sm" href="/dashboard" />
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-muted/50">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent />
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

function SidebarLink({
  item, active, highlight,
}: {
  item: NavItem; active: boolean; highlight?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium"
          : highlight
          ? "text-primary hover:bg-primary/10"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
      {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />}
    </Link>
  );
}
