"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { charityUpsertSchema, type CharityUpsertInput } from "@/lib/validations/charity";
import { adminUpdateCharity } from "@/server/actions/admin";
import { createClient } from "@/lib/supabase/client";

export default function EditCharityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CharityUpsertInput>({
    resolver: zodResolver(charityUpsertSchema),
    defaultValues: { isFeatured: false, isActive: true, upcomingEvents: [] },
  });

  const isFeatured = watch("isFeatured");
  const isActive = watch("isActive");

  useEffect(() => {
    const supabase = createClient();
    supabase.from("charities").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      const d = data as {
        slug: string; name: string; description: string;
        cover_image_url: string | null; logo_url: string | null;
        website_url: string | null; is_featured: boolean; is_active: boolean;
      } | null;
      if (d) reset({
        slug: d.slug, name: d.name, description: d.description,
        coverImageUrl: d.cover_image_url ?? undefined,
        logoUrl: d.logo_url ?? undefined,
        websiteUrl: d.website_url ?? undefined,
        isFeatured: d.is_featured, isActive: d.is_active, upcomingEvents: [],
      });
    });
  }, [id, reset]);

  const onSubmit = (data: CharityUpsertInput) => {
    startTransition(async () => {
      const result = await adminUpdateCharity(id, data);
      if (result?.error) toast.error(result.error);
      else { toast.success("Charity updated"); router.push("/admin/charities"); }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 border-b bg-background px-6 py-4">
        <Button variant="ghost" size="sm" asChild className="h-8">
          <Link href="/admin/charities"><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Charities</Link>
        </Button>
        <h1 className="text-xl font-semibold">Edit charity</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-xl space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Charity name *</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">URL slug *</Label>
          <Input id="slug" {...register("slug")} />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" rows={4} {...register("description")} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input id="websiteUrl" type="url" {...register("websiteUrl")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="coverImageUrl">Cover image URL</Label>
          <Input id="coverImageUrl" type="url" {...register("coverImageUrl")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input id="logoUrl" type="url" {...register("logoUrl")} />
        </div>
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium text-sm">Featured charity</p>
            <p className="text-xs text-muted-foreground">Shown prominently on the homepage</p>
          </div>
          <Switch checked={isFeatured} onCheckedChange={(v) => setValue("isFeatured", v)} />
        </div>
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium text-sm">Active</p>
            <p className="text-xs text-muted-foreground">Visible to users for selection</p>
          </div>
          <Switch checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
