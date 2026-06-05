import { requireRole } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("ADMIN");

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20 dark:bg-background">
      <AdminSidebar profile={session.profile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
