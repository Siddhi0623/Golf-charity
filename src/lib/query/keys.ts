/**
 * TanStack Query keys, centralised. Importing constants here avoids the
 * "did I spell the key right?" bug class when invalidating from a mutation.
 */
export const qk = {
  me: ["me"] as const,
  scores: (userId?: string) => ["scores", userId] as const,
  subscription: (userId?: string) => ["subscription", userId] as const,
  userCharity: (userId?: string) => ["user-charity", userId] as const,
  charities: { all: ["charities"] as const, detail: (slug: string) => ["charities", slug] as const },
  draws: {
    all: ["draws"] as const,
    detail: (id: string) => ["draws", id] as const,
    upcoming: ["draws", "upcoming"] as const,
  },
  winnings: (userId?: string) => ["winnings", userId] as const,
  notifications: (userId?: string) => ["notifications", userId] as const,
  admin: {
    users: ["admin", "users"] as const,
    subs: ["admin", "subs"] as const,
    winners: ["admin", "winners"] as const,
    analytics: ["admin", "analytics"] as const,
  },
};
