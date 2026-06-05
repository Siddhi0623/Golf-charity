/**
 * Hand-written domain types that the rest of the app should import.
 * These mirror the enums in 0001_init_schema.sql so we don't have to
 * regenerate database.types.ts to use them at compile time.
 */

export type UserRole = "USER" | "ADMIN";
export type SubPlan = "MONTHLY" | "YEARLY";
export type SubStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type DrawMode = "RANDOM" | "WEIGHTED";
export type DrawStatus = "DRAFT" | "PUBLISHED";
export type MatchCount = "THREE" | "FOUR" | "FIVE";
export type VerifyStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PayoutStatus = "PENDING" | "PAID";
export type NotificationKind =
  | "SUB_EXPIRING"
  | "SUB_EXPIRED"
  | "DRAW_PUBLISHED"
  | "YOU_WON"
  | "PROOF_APPROVED"
  | "PROOF_REJECTED"
  | "PAID";

export type Profile = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
};

export type Charity = {
  id: string;
  slug: string;
  name: string;
  description: string;
  coverImageUrl: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  upcomingEvents: Array<{ title: string; date: string; location?: string }>;
  isFeatured: boolean;
  isActive: boolean;
};

export type Subscription = {
  id: string;
  userId: string;
  plan: SubPlan;
  status: SubStatus;
  startDate: string;
  expiryDate: string;
  price: number;
  charityId: string | null;
  contributionPct: number | null;
};

export type Score = {
  id: string;
  userId: string;
  score: number;
  playedAt: string;
  createdAt: string;
};

export type Draw = {
  id: string;
  drawMonth: string;
  mode: DrawMode;
  status: DrawStatus;
  winningNumbers: number[] | null;
  poolTotal: number;
  jackpotCarryIn: number;
  jackpotCarryOut: number;
  publishedAt: string | null;
};

export type Winner = {
  id: string;
  drawId: string;
  userId: string;
  matchCount: MatchCount;
  prizeAmount: number;
  proofUrl: string | null;
  proofNotes: string | null;
  verification: VerifyStatus;
  verifiedAt: string | null;
};

export type Payout = {
  id: string;
  winnerId: string;
  amount: number;
  status: PayoutStatus;
  paidAt: string | null;
  adminNotes: string | null;
};

/**
 * Placeholder for the auto-generated Supabase database types until
 * `npm run db:types` is run against a real project. Without this stub
 * the supabase clients will fail to compile.
 */
export type DatabaseStub = unknown;
