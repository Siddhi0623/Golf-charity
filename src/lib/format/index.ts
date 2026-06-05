import { format, formatDistanceToNow, parseISO } from "date-fns";

/** Format a number as GBP. e.g. 1234.5 → "£1,234.50" */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Short date. e.g. "12 Jun 2026" */
export function formatDate(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  return format(d, "d MMM yyyy");
}

/** Month + year label. e.g. "June 2026" */
export function formatMonth(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  return format(d, "MMMM yyyy");
}

/** Relative time. e.g. "3 days ago" */
export function timeAgo(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  return formatDistanceToNow(d, { addSuffix: true });
}

/** First day of a month as a YYYY-MM-DD string. */
export function monthStart(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

/** Capitalise first letter. */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/** Convert a snake_case DB match_count enum to a readable label. */
export function matchCountLabel(m: "THREE" | "FOUR" | "FIVE"): string {
  return { THREE: "3 Match", FOUR: "4 Match", FIVE: "5 Match — Jackpot" }[m];
}

/** Days remaining until a subscription or deadline expires (floor at 0). */
export function daysUntilExpiry(expiry: string | Date): number {
  const e = expiry instanceof Date ? expiry : new Date(expiry);
  const ms = e.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
