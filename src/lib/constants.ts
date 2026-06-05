export const APP_NAME = "Fairway";
export const APP_TAGLINE = "Play. Give. Win together.";
export const APP_DESCRIPTION =
  "A modern membership where every score sent into the world fuels a charity you choose, and every month gives back through a community prize draw.";

export const MIN_CONTRIBUTION_PCT = 10;
export const DEFAULT_CONTRIBUTION_PCT = 25;
export const CHARITY_MIN_PCT = 10;

export const SCORE_HISTORY_LIMIT = 5;

export const PLAN_PRICE = {
  MONTHLY: Number(process.env.NEXT_PUBLIC_PRICE_MONTHLY ?? 9.99),
  YEARLY: Number(process.env.NEXT_PUBLIC_PRICE_YEARLY ?? 99),
} as const;

export const PLATFORM_STATS = {
  totalDonated: "£42,800",
  members: 1240,
  charities: 6,
  jackpotWinners: 3,
} as const;

export const PRIZE_SPLIT = {
  FIVE: 0.4,
  FOUR: 0.35,
  THREE: 0.25,
} as const;

export const MATCH_LABEL: Record<"THREE" | "FOUR" | "FIVE", string> = {
  FIVE: "5 Match — Jackpot",
  FOUR: "4 Match",
  THREE: "3 Match",
};
