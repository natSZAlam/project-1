import { Clock } from "lucide-react";
import { isOpenNow } from "@/lib/hours";
import type { WeeklyHours } from "@/lib/types";

export default function HoursBadge({ hours }: { hours: WeeklyHours | undefined }) {
  const open = isOpenNow(hours);
  if (open === null) return null;

  return (
    <span
      className="block-chip inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold"
      style={{
        backgroundColor: open ? "var(--color-eatin-bg)" : "var(--color-eatout-bg)",
        color: open ? "var(--color-eatin)" : "var(--color-eatout)",
      }}
    >
      <Clock size={10} aria-hidden="true" />
      {open ? "Open now" : "Closed now"}
    </span>
  );
}
