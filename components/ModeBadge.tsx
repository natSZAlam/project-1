import { ChefHat, UtensilsCrossed, Bike } from "lucide-react";
import type { Mode } from "@/lib/types";

const MODE_CONFIG: Record<
  Mode,
  { icon: typeof ChefHat; color: string; bg: string }
> = {
  "Eat In": {
    icon: ChefHat,
    color: "var(--color-eatin)",
    bg: "var(--color-eatin-bg)",
  },
  "Eat Out": {
    icon: UtensilsCrossed,
    color: "var(--color-eatout)",
    bg: "var(--color-eatout-bg)",
  },
  "Order In": {
    icon: Bike,
    color: "var(--color-orderin)",
    bg: "var(--color-orderin-bg)",
  },
};

export default function ModeBadge({
  mode,
  className = "",
}: {
  mode: Mode;
  className?: string;
}) {
  const { icon: Icon, color, bg } = MODE_CONFIG[mode];
  return (
    <span
      className={`block-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-extrabold ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      <Icon size={14} strokeWidth={2.75} aria-hidden="true" />
      {mode}
    </span>
  );
}
