import type { MatchCount } from "@/types/domain";

export const TIER_SHARE = {
  FIVE: 0.4,
  FOUR: 0.35,
  THREE: 0.25,
} as const satisfies Record<MatchCount, number>;

/**
 * Round to 2 decimal places. Use everywhere prizes/contributions are written
 * to the database so we never persist sub-cent fractions.
 */
export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Compute the platform-retained portion of a subscription:
 *   pool_contribution = price * (1 - contribution_pct / 100)
 *
 * The charity gets the remainder. We accept an array of active subscriptions
 * (with their snapshotted contribution_pct from subscription start time)
 * so the math is reproducible after a user later switches charity.
 */
export type SubSnapshot = {
  price: number;
  contributionPct: number; // 10..100
};

export function computePoolTotal(activeSubs: SubSnapshot[]): number {
  let total = 0;
  for (const s of activeSubs) {
    const pct = Math.max(10, Math.min(100, s.contributionPct));
    total += s.price * (1 - pct / 100);
  }
  return round2(total);
}

export function computeCharityTotal(activeSubs: SubSnapshot[]): number {
  let total = 0;
  for (const s of activeSubs) {
    const pct = Math.max(10, Math.min(100, s.contributionPct));
    total += s.price * (pct / 100);
  }
  return round2(total);
}

/**
 * Allocate a prize pool across the three tiers and return the per-winner
 * amount + the carry-out (only the 5-match tier rolls over).
 */
export type PrizeAllocation = {
  perWinner: Record<MatchCount, number>;
  tierPool: Record<MatchCount, number>;
  carryOut: number;
};

export function allocatePrizes(
  poolWithCarryIn: number,
  winnerCounts: Record<MatchCount, number>,
): PrizeAllocation {
  const tierPool: Record<MatchCount, number> = {
    FIVE: round2(poolWithCarryIn * TIER_SHARE.FIVE),
    FOUR: round2(poolWithCarryIn * TIER_SHARE.FOUR),
    THREE: round2(poolWithCarryIn * TIER_SHARE.THREE),
  };

  const perWinner: Record<MatchCount, number> = { FIVE: 0, FOUR: 0, THREE: 0 };
  let carryOut = 0;

  for (const tier of ["FIVE", "FOUR", "THREE"] as const) {
    const n = winnerCounts[tier];
    if (n > 0) {
      perWinner[tier] = round2(tierPool[tier] / n);
    } else if (tier === "FIVE") {
      // Only the 5-tier rolls over.
      carryOut += tierPool[tier];
    }
  }

  return { perWinner, tierPool, carryOut: round2(carryOut) };
}
