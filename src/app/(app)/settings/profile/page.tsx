"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/server/actions/profile";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const schema = z.object({ fullName: z.string().trim().min(2).max(80) });
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ fullName: string | null; email: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();
      const row = data as { full_name: string | null; email: string } | null;
      if (row) {
        setProfile({ fullName: row.full_name, email: row.email });
        reset({ fullName: row.full_name ?? "" });
      }
    });
  }, [reset]);

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = await updateProfile({ fullName: data.fullName });
      if (result?.error) toast.error(result.error);
      else toast.success("Profile updated");
    });
  };

  const initials = (profile?.fullName ?? profile?.email ?? "U")
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="border-b bg-background px-6 py-4">
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Update your personal information</p>
      </div>
      <div className="p-6 max-w-lg space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{profile?.fullName ?? "—"}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" placeholder="Alex Johnson" {...register("fullName")} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile?.email ?? ""} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Email is managed by your authentication provider.</p>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
