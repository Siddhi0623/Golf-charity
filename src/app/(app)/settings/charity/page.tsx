"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Heart, CheckCircle2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { selectCharity } from "@/server/actions/charity";
import { cn } from "@/lib/utils";
import { CHARITY_MIN_PCT } from "@/lib/constants";

type CharityRow = {
  id: string; slug: string; name: string; description: string;
  logo_url: string | null; is_featured: boolean;
};

export default function CharitySettingsPage() {
  const [charities, setCharities] = useState<CharityRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contributionPct, setContributionPct] = useState(25);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [chRes, ucRes] = await Promise.all([
        supabase.from("charities").select("id, slug, name, description, logo_url, is_featured")
          .eq("is_active", true).order("is_featured", { ascending: false }).order("name"),
        supabase.from("user_charities").select("charity_id, contribution_pct").eq("user_id", user.id).maybeSingle(),
      ]);

      setCharities((chRes.data ?? []) as CharityRow[]);
      const uc = ucRes.data as { charity_id: string; contribution_pct: number } | null;
      if (uc) { setSelectedId(uc.charity_id); setContributionPct(uc.contribution_pct); }
    };
    load();
  }, []);

  const handleSave = () => {
    if (!selectedId) { toast.error("Please select a charity first"); return; }
    startTransition(async () => {
      const result = await selectCharity({ charityId: selectedId, contributionPct });
      if (result?.error) toast.error(result.error);
      else toast.success("Charity selection saved!");
    });
  };

  return (
    <div>
      <div className="border-b bg-background px-6 py-4">
        <h1 className="text-xl font-semibold">My Charity</h1>
        <p className="text-sm text-muted-foreground">
          Choose the charity that receives your monthly contribution
        </p>
      </div>

      <div className="p-6 space-y-6 max-w-2xl">
        {/* Contribution slider */}
        <div className="card-elevated rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            <h2 className="font-semibold text-sm">Contribution percentage</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Charity gets</span>
              <span className="font-bold text-lg text-primary">{contributionPct}%</span>
            </div>
            <input
              type="range"
              min={CHARITY_MIN_PCT}
              max={100}
              step={5}
              value={contributionPct}
              onChange={(e) => setContributionPct(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min {CHARITY_MIN_PCT}%</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              The remaining {100 - contributionPct}% goes into the monthly prize pool.
            </p>
          </div>
        </div>

        {/* Charity grid */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm">Select a charity</h2>
          {charities.length === 0 ? (
            <p className="text-muted-foreground text-sm">Loading charities…</p>
          ) : (
            <div className="grid gap-3">
              {charities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full text-left rounded-2xl border-2 p-4 transition-all",
                    selectedId === c.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {c.logo_url && (
                      <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden border bg-background">
                        <Image src={c.logo_url} alt={c.name} fill className="object-cover" sizes="40px" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{c.name}</p>
                        {c.is_featured && (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">Featured</Badge>
                        )}
                        {selectedId === c.id && (
                          <CheckCircle2 className="h-4 w-4 text-primary ml-auto shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={isPending || !selectedId} className="w-full sm:w-auto">
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save charity selection"}
        </Button>
      </div>
    </div>
  );
}
