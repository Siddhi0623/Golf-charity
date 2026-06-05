import { cn } from "@/lib/utils";

interface NumberBallProps {
  number: number;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "winner" | "matched" | "user" | "ghost";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg font-bold",
  xl: "h-16 w-16 text-xl font-bold",
};

const VARIANT_CLASSES = {
  default:
    "border-2 border-muted-foreground/30 bg-background text-foreground",
  winner:
    "border-2 border-amber-400 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20",
  matched:
    "border-2 border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20",
  user:
    "border-2 border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  ghost:
    "border-2 border-dashed border-muted-foreground/20 text-muted-foreground/40",
};

export function NumberBall({ number, size = "md", variant = "default", className }: NumberBallProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold transition-all",
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {number}
    </div>
  );
}

interface NumberBallRowProps {
  numbers: number[];
  size?: NumberBallProps["size"];
  variant?: NumberBallProps["variant"];
  matchedNumbers?: Set<number>;
  gap?: string;
}

export function NumberBallRow({
  numbers, size = "md", variant = "default",
  matchedNumbers, gap = "gap-2",
}: NumberBallRowProps) {
  return (
    <div className={cn("flex flex-wrap", gap)}>
      {numbers.map((n) => (
        <NumberBall
          key={n}
          number={n}
          size={size}
          variant={matchedNumbers?.has(n) ? "matched" : variant}
        />
      ))}
    </div>
  );
}
