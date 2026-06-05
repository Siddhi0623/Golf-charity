import type { MatchCount } from "@/types/domain";

/**
 * Count how many of the user's distinct scores appear in the winning numbers.
 *
 * Rules:
 *  - Duplicate scores (same value entered twice) count once.
 *  - Only 3, 4, or 5 matches qualify as a winning match.
 *  - Returns null when below the 3-match floor.
 */
export function classifyMatches(
  userScores: number[],
  winningNumbers: number[],
): MatchCount | null {
  const winSet = new Set(winningNumbers);
  const matched = new Set<number>();
  for (const s of userScores) {
    if (winSet.has(s)) matched.add(s);
  }
  const n = matched.size;
  if (n === 5) return "FIVE";
  if (n === 4) return "FOUR";
  if (n === 3) return "THREE";
  return null;
}

export type UserMatch = {
  userId: string;
  matchCount: MatchCount;
};

export function matchUsers(
  userScores: Array<{ userId: string; scores: number[] }>,
  winningNumbers: number[],
): UserMatch[] {
  const out: UserMatch[] = [];
  for (const u of userScores) {
    const m = classifyMatches(u.scores, winningNumbers);
    if (m) out.push({ userId: u.userId, matchCount: m });
  }
  return out;
}
