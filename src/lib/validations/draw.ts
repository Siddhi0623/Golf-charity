import { z } from "zod";
import { DRAW_COUNT, DRAW_MAX, DRAW_MIN } from "@/lib/draw/generate";

export const drawModeSchema = z.enum(["RANDOM", "WEIGHTED"]);
export type DrawModeInput = z.infer<typeof drawModeSchema>;

export const drawCreateSchema = z.object({
  drawMonth: z
    .string()
    .regex(/^\d{4}-\d{2}-01$/, "First day of month, YYYY-MM-01"),
  mode: drawModeSchema,
});
export type DrawCreateInput = z.infer<typeof drawCreateSchema>;

export const drawSimulateSchema = z.object({
  drawId: z.string().uuid(),
  seed: z.number().int().optional(),
});

export const winningNumbersSchema = z
  .array(z.number().int().min(DRAW_MIN).max(DRAW_MAX))
  .length(DRAW_COUNT)
  .refine((arr) => new Set(arr).size === arr.length, {
    message: "Numbers must be unique",
  });

export const winnerProofSchema = z.object({
  winnerId: z.string().uuid(),
  proofUrl: z.string().url(),
  proofNotes: z.string().trim().max(500).optional(),
});
export type WinnerProofInput = z.infer<typeof winnerProofSchema>;

export const winnerVerificationSchema = z.object({
  winnerId: z.string().uuid(),
  verification: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().trim().max(500).optional(),
});
export type WinnerVerificationInput = z.infer<typeof winnerVerificationSchema>;

export const payoutMarkPaidSchema = z.object({
  payoutId: z.string().uuid(),
  adminNotes: z.string().trim().max(500).optional(),
});
