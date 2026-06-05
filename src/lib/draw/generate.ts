import type { DrawMode } from "@/types/domain";

export const DRAW_COUNT = 5;
export const DRAW_MIN = 1;
export const DRAW_MAX = 45;

/**
 * Deterministic PRNG (mulberry32). Given the same seed, returns the same
 * sequence — used by the admin draw simulator so a preview that's about to
 * be published produces the exact same winning numbers.
 */
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick5(rand: () => number, weights?: number[]): number[] {
  const pool = Array.from({ length: DRAW_MAX - DRAW_MIN + 1 }, (_, i) => DRAW_MIN + i);
  const w = weights
    ? [...weights]
    : Array.from({ length: pool.length }, () => 1);

  const result: number[] = [];
  while (result.length < DRAW_COUNT && pool.length > 0) {
    const total = w.reduce((acc, x) => acc + x, 0);
    if (total <= 0) {
      // All remaining weights zero — fall back to uniform.
      const idx = Math.floor(rand() * pool.length);
      result.push(pool[idx]!);
      pool.splice(idx, 1);
      w.splice(idx, 1);
      continue;
    }
    let target = rand() * total;
    let idx = 0;
    for (; idx < w.length; idx++) {
      target -= w[idx]!;
      if (target <= 0) break;
    }
    if (idx >= pool.length) idx = pool.length - 1;
    result.push(pool[idx]!);
    pool.splice(idx, 1);
    w.splice(idx, 1);
  }
  return result.sort((a, b) => a - b);
}

export type DrawInput = {
  mode: DrawMode;
  /** Optional seed for reproducible previews. */
  seed?: number;
  /**
   * For WEIGHTED mode: array of score values that have been entered by users
   * in the draw period. Frequency boosts the chance of that number.
   */
  scoreHistory?: number[];
};

export function generateWinningNumbers(input: DrawInput): number[] {
  const seed = input.seed ?? Math.floor(Math.random() * 2 ** 32);
  const rand = mulberry32(seed);

  if (input.mode === "WEIGHTED") {
    const freq = new Array(DRAW_MAX - DRAW_MIN + 1).fill(0);
    for (const s of input.scoreHistory ?? []) {
      if (s >= DRAW_MIN && s <= DRAW_MAX) {
        freq[s - DRAW_MIN]++;
      }
    }
    // Smooth so unseen numbers can still be drawn (Laplace, alpha=1).
    const weights = freq.map((f) => f + 1);
    return pick5(rand, weights);
  }

  return pick5(rand);
}

export function isValidWinningNumbers(nums: unknown): nums is number[] {
  if (!Array.isArray(nums) || nums.length !== DRAW_COUNT) return false;
  const seen = new Set<number>();
  for (const n of nums) {
    if (typeof n !== "number" || !Number.isInteger(n)) return false;
    if (n < DRAW_MIN || n > DRAW_MAX) return false;
    if (seen.has(n)) return false;
    seen.add(n);
  }
  return true;
}
