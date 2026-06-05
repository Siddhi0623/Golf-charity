import { format, formatDistanceToNow } from "date-fns";

export function formatDate(d: string | Date | null | undefined, pattern = "d MMM yyyy") {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, pattern);
}

export function formatDateTime(d: string | Date | null | undefined) {
  return formatDate(d, "d MMM yyyy, HH:mm");
}

export function formatMonth(d: string | Date | null | undefined) {
  return formatDate(d, "MMMM yyyy");
}

export function formatRelative(d: string | Date) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function firstOfMonth(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
