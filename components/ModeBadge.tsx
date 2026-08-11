import { ChefHat, UtensilsCrossed, Bike } from "lucide-react";
import type { Mode } from "@/lib/types";

const MODE_CONFIG: Record<
  Mode,
  { icon: typeof ChefHat; color: string; bg: string }
> = {
  "Eat In": { icon: ChefHat, color: "var(--color-eatin)", bg: "#eaf1de" },
  "Eat Out": { icon: UtensilsCrossed, color: "var(--color-eatout)", bg: "#f3e3d8" },
  "Order In": { icon: Bike, color: "var(--color-orderin)", bg: "#f6e8d3" },
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      <Icon size={14} strokeWidth={2.5} aria-hidden="true" />
      {mode}
    </span>
  );
}
