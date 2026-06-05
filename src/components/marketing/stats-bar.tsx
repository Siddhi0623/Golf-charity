import { PLATFORM_STATS } from "@/lib/constants";

const stats = [
  { label: "Donated to charities", value: PLATFORM_STATS.totalDonated },
  { label: "Active members", value: PLATFORM_STATS.members.toLocaleString() },
  { label: "Charity partners", value: String(PLATFORM_STATS.charities) },
  { label: "Jackpot winners", value: String(PLATFORM_STATS.jackpotWinners) },
] as const;

export function StatsBar() {
  return (
    <section className="bg-primary/5 border-y border-border/60">
      <div className="container py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center space-y-1">
              <p className="text-3xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
