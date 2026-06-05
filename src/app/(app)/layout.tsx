import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const { data: subRaw } = await supabase
    .from("subscriptions")
    .select("status, plan, expiry_date")
    .eq("user_id", session.profile.id)
    .eq("status", "ACTIVE")
    .maybeSingle();

  const sub = subRaw as {
    status: string;
    plan: string;
    expiry_date: string;
  } | null;

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20 dark:bg-background">
      <AppSidebar
        profile={session.profile}
        subscription={sub ? { status: sub.status, plan: sub.plan, expiryDate: sub.expiry_date } : null}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
