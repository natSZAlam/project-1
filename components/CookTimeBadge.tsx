import { Timer } from "lucide-react";
import type { CookTime } from "@/lib/types";

export default function CookTimeBadge({ cookTime }: { cookTime: CookTime | undefined }) {
  if (!cookTime) return null;
  return (
    <span className="block-chip inline-flex items-center gap-1 bg-muted px-2 py-0.5 text-[10px] font-extrabold text-foreground">
      <Timer size={10} aria-hidden="true" />
      {cookTime}
    </span>
  );
}
