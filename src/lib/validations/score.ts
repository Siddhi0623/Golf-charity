import { z } from "zod";
import { DRAW_MAX, DRAW_MIN } from "@/lib/draw/generate";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const scoreCreateSchema = z.object({
  score: z
    .number()
    .int("Whole number")
    .min(DRAW_MIN, `At least ${DRAW_MIN}`)
    .max(DRAW_MAX, `At most ${DRAW_MAX}`),
  playedAt: dateString,
});
export type ScoreCreateInput = z.infer<typeof scoreCreateSchema>;

export const scoreUpdateSchema = scoreCreateSchema.extend({
  id: z.string().uuid(),
});
export type ScoreUpdateInput = z.infer<typeof scoreUpdateSchema>;

export const scoreIdSchema = z.object({ id: z.string().uuid() });
