"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scoreCreateSchema, type ScoreCreateInput } from "@/lib/validations/score";
import { addScore, updateScore } from "@/server/actions/scores";
import { DRAW_MIN, DRAW_MAX } from "@/lib/draw/generate";

interface ScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an existing score to edit mode. Omit for add mode. */
  editScore?: { id: string; score: number; playedAt: string };
  onSuccess?: () => void;
}

export function ScoreDialog({ open, onOpenChange, editScore, onSuccess }: ScoreDialogProps) {
  const isEdit = !!editScore;
  const [isPending, startTransition] = useTransition();

  const today = new Date().toISOString().slice(0, 10);

  const {
    register, handleSubmit, reset,
    formState: { errors },
  } = useForm<ScoreCreateInput>({
    resolver: zodResolver(scoreCreateSchema),
    defaultValues: {
      score: editScore?.score ?? (undefined as unknown as number),
      playedAt: editScore?.playedAt ?? today,
    },
  });

  const onSubmit = (data: ScoreCreateInput) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateScore({ id: editScore!.id, score: data.score, playedAt: data.playedAt })
        : await addScore({ score: data.score, playedAt: data.playedAt });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Score updated" : "Score added");
        reset();
        onOpenChange(false);
        onSuccess?.();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit score" : "Add a score"}</DialogTitle>
          <DialogDescription>
            Scores must be between {DRAW_MIN} and {DRAW_MAX}. Only your 5 most recent
            scores are kept.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="score">Score (1–45)</Label>
            <Input
              id="score"
              type="number"
              min={DRAW_MIN}
              max={DRAW_MAX}
              placeholder="e.g. 23"
              {...register("score", { valueAsNumber: true })}
              aria-invalid={!!errors.score}
              autoFocus
            />
            {errors.score && (
              <p className="text-xs text-destructive">{errors.score.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="playedAt">Date played</Label>
            <Input
              id="playedAt"
              type="date"
              max={today}
              {...register("playedAt")}
              aria-invalid={!!errors.playedAt}
            />
            {errors.playedAt && (
              <p className="text-xs text-destructive">{errors.playedAt.message}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : isEdit ? (
                "Update score"
              ) : (
                "Add score"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
