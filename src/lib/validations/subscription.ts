import { z } from "zod";

export const subscriptionPlanSchema = z.enum(["MONTHLY", "YEARLY"]);
export type SubscriptionPlanInput = z.infer<typeof subscriptionPlanSchema>;

export const checkoutStartSchema = z.object({
  plan: subscriptionPlanSchema,
});
export type CheckoutStartInput = z.infer<typeof checkoutStartSchema>;

export const subscriptionStatusSchema = z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]);
