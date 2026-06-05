"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScoreDialog } from "./score-dialog";
import { deleteScore } from "@/server/actions/scores";
import { formatDate } from "@/lib/format";
import { DRAW_COUNT } from "@/lib/draw/generate";

type Score = { id: string; score: number; playedAt: string; createdAt: string };

interface ScoreTableProps {
  initialScores: Score[];
}

export function ScoreTable({ initialScores }: ScoreTableProps) {
  const [scores, setScores] = useState(initialScores);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this score? This cannot be undone.")) return;
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteScore(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        setScores((prev) => prev.filter((s) => s.id !== id));
        toast.success("Score deleted");
      }
      setDeletingId(null);
    });
  };

  const handleEdit = (score: Score) => {
    setEditingScore(score);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingScore(undefined);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    // Refresh via router.refresh() approach — revalidation will update initialScores
    // on next render. For now, optimistically handle via revalidatePath in server action.
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Score history</h2>
          <p className="text-sm text-muted-foreground">
            {scores.length} / {DRAW_COUNT} scores on file
          </p>
        </div>
        <Button size="sm" onClick={handleAdd} disabled={scores.length >= DRAW_COUNT}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add score
        </Button>
      </div>

      {scores.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center space-y-3">
          <p className="text-2xl">🎯</p>
          <p className="font-medium">No scores yet</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Add up to 5 scores between 1–45. Your latest scores are entered into the monthly draw.
          </p>
          <Button onClick={handleAdd}>Add your first score</Button>
        </div>
      ) : (
        <div className="card-elevated rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Score</TableHead>
                <TableHead>Date played</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((s, idx) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{s.score}</span>
                      {idx === 0 && (
                        <Badge variant="success" className="text-[10px] px-1.5 py-0">
                          Latest
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(s.playedAt)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(s.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => handleEdit(s)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive"
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                      >
                        {deletingId === s.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />
                        }
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ScoreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editScore={editingScore}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
