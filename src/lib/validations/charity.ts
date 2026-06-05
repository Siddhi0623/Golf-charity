import { z } from "zod";

export const upcomingEventSchema = z.object({
  title: z.string().trim().min(2).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  location: z.string().trim().max(120).optional(),
});
export type UpcomingEventInput = z.infer<typeof upcomingEventSchema>;

export const charityUpsertSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers, hyphens"),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(800),
  coverImageUrl: z.string().url().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  upcomingEvents: z.array(upcomingEventSchema).max(20).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export type CharityUpsertInput = z.infer<typeof charityUpsertSchema>;

export const userCharitySelectSchema = z.object({
  charityId: z.string().uuid(),
  contributionPct: z
    .number()
    .min(10, "At least 10%")
    .max(100, "At most 100%")
    .refine((n) => Math.round(n * 100) === n * 100, {
      message: "Up to 2 decimal places",
    }),
});
export type UserCharitySelectInput = z.infer<typeof userCharitySelectSchema>;
