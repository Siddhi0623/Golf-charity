"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, CreditCard, Heart, Dices,
  Trophy, BarChart2, LogOut, Menu, X, ChevronRight, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/domain";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/charities", label: "Charities", icon: Heart },
  { href: "/admin/draws", label: "Draws", icon: Dices },
  { href: "/admin/winners", label: "Winners", icon: Trophy },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

export function AdminSidebar({ profile }: { profile: Profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const initials = (profile.fullName ?? profile.email)
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-4 border-b">
        <Logo size="sm" href="/admin" />
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Admin</Badge>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />}
            </Link>
          );
        })}

        <Separator className="my-3" />

        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to app
        </Link>
      </nav>

      <div className="p-3 border-t">
        <div className="flex items-center gap-2.5 rounded-xl p-2 group">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none truncate">{profile.fullName ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Administrator</p>
          </div>
          <Button
            variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
            onClick={handleSignOut}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-background">
        <SidebarContent />
      </aside>

      {/* Mobile */}
      <div className="md:hidden">
        <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur px-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" href="/admin" />
            <Badge variant="secondary" className="text-[10px]">Admin</Badge>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-muted/50" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <div className="h-14" />
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <aside className="relative z-10 w-64 bg-background border-r h-full flex flex-col">
              <div className="flex h-14 items-center justify-between px-4 border-b">
                <Logo size="sm" href="/admin" />
                <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto"><SidebarContent /></div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
