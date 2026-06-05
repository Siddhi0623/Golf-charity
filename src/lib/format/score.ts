import type { MatchCount } from "@/types/domain";

export const MATCH_LABEL: Record<MatchCount, string> = {
  FIVE: "5 Match",
  FOUR: "4 Match",
  THREE: "3 Match",
};

export const MATCH_BADGE_CLASS: Record<MatchCount, string> = {
  FIVE: "bg-brand-600 text-white",
  FOUR: "bg-brand-500 text-white",
  THREE: "bg-brand-400 text-brand-900",
};
