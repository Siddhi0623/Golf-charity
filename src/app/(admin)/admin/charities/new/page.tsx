"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { charityUpsertSchema, type CharityUpsertInput } from "@/lib/validations/charity";
import { adminCreateCharity } from "@/server/actions/admin";

export default function NewCharityPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CharityUpsertInput>({
    resolver: zodResolver(charityUpsertSchema),
    defaultValues: { isFeatured: false, isActive: true, upcomingEvents: [] },
  });

  const isFeatured = watch("isFeatured");
  const isActive = watch("isActive");

  const onSubmit = (data: CharityUpsertInput) => {
    startTransition(async () => {
      const result = await adminCreateCharity(data);
      if (result?.error) toast.error(result.error);
      else { toast.success("Charity created"); router.push("/admin/charities"); }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 border-b bg-background px-6 py-4">
        <Button variant="ghost" size="sm" asChild className="h-8">
          <Link href="/admin/charities"><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Charities</Link>
        </Button>
        <h1 className="text-xl font-semibold">New charity</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-xl space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Charity name *</Label>
          <Input id="name" placeholder="HopeBridge Foundation" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug">URL slug *</Label>
          <Input id="slug" placeholder="hopebridge" {...register("slug")} />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" rows={4} placeholder="What this charity does…" {...register("description")} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input id="websiteUrl" type="url" placeholder="https://example.org" {...register("websiteUrl")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="coverImageUrl">Cover image URL</Label>
          <Input id="coverImageUrl" type="url" placeholder="https://images.unsplash.com/..." {...register("coverImageUrl")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input id="logoUrl" type="url" placeholder="https://..." {...register("logoUrl")} />
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
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "Create charity"}
        </Button>
      </form>
    </div>
  );
}
