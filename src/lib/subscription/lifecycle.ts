import type { SubPlan } from "@/types/domain";

export const PLAN_DURATION_DAYS: Record<SubPlan, number> = {
  MONTHLY: 30,
  YEARLY: 365,
};

export const PLAN_PRICE: Record<SubPlan, number> = {
  MONTHLY: Number(process.env.NEXT_PUBLIC_PRICE_MONTHLY ?? 9.99),
  YEARLY: Number(process.env.NEXT_PUBLIC_PRICE_YEARLY ?? 99),
};

export function computeExpiry(plan: SubPlan, start: Date = new Date()): Date {
  const expiry = new Date(start);
  expiry.setUTCDate(expiry.getUTCDate() + PLAN_DURATION_DAYS[plan]);
  return expiry;
}

export function isSubscriptionActive(sub: {
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  expiry_date: string | Date;
} | null | undefined): boolean {
  if (!sub) return false;
  if (sub.status !== "ACTIVE") return false;
  const expiry = sub.expiry_date instanceof Date ? sub.expiry_date : new Date(sub.expiry_date);
  return expiry.getTime() > Date.now();
}

export function daysUntilExpiry(expiry: string | Date): number {
  const e = expiry instanceof Date ? expiry : new Date(expiry);
  const ms = e.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
