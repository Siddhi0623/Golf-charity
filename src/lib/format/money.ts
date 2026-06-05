const formatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatMoney(amount: number | string | null | undefined): string {
  if (amount == null) return formatter.format(0);
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return formatter.format(0);
  return formatter.format(n);
}

export function formatMoneyCompact(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return compactFormatter.format(0);
  return compactFormatter.format(n);
}

export function formatPct(n: number, digits = 0): string {
  return `${n.toFixed(digits)}%`;
}
