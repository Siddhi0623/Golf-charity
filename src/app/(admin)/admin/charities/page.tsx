"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { adminDeleteCharity } from "@/server/actions/admin";

type CharityRow = {
  id: string; slug: string; name: string;
  logo_url: string | null; website_url: string | null;
  is_featured: boolean; is_active: boolean;
};

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<CharityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("charities")
      .select("id, slug, name, logo_url, website_url, is_featured, is_active")
      .order("is_featured", { ascending: false })
      .order("name");
    setCharities((data ?? []) as CharityRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? It will be hidden from users.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await adminDeleteCharity(id);
      if (result?.error) toast.error(result.error);
      else { toast.success("Charity archived"); load(); }
      setDeletingId(null);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">Charities</h1>
          <p className="text-sm text-muted-foreground">Manage the charities on the platform</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/charities/new">
            <Plus className="h-4 w-4 mr-1.5" /> Add charity
          </Link>
        </Button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : charities.length === 0 ? (
          <p className="text-muted-foreground text-sm">No charities yet.</p>
        ) : (
          <div className="card-elevated rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Charity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {charities.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {c.logo_url && (
                          <div className="relative h-8 w-8 rounded-lg overflow-hidden border bg-background shrink-0">
                            <Image src={c.logo_url} alt={c.name} fill className="object-cover" sizes="32px" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">/charities/{c.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "success" : "secondary"} className="text-xs">
                        {c.is_active ? "Active" : "Archived"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.is_featured ? (
                        <Badge variant="warning" className="text-xs">Featured</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        {c.website_url && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={c.website_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/charities/${c.id}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={deletingId === c.id}
                        >
                          {deletingId === c.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
