import { Home, GraduationCap } from "lucide-react";
import type { Entry, Settings } from "@/lib/types";
import { formatKm, nearestBy, withDistances } from "@/lib/geo";

export default function DistanceBadges({
  entry,
  settings,
}: {
  entry: Entry;
  settings: Settings;
}) {
  if (entry.mode !== "Eat Out" || !entry.locations?.length) return null;
  if (!settings.home?.geo && !settings.university?.geo) return null;

  const distances = withDistances(entry.locations, settings);
  const nearestHome = nearestBy(distances, "distanceToHome");
  const nearestUniversity = nearestBy(distances, "distanceToUniversity");

  if (!nearestHome && !nearestUniversity) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {nearestHome && (
        <span className="block-chip inline-flex items-center gap-1 bg-muted px-2 py-0.5 text-[11px] font-extrabold text-foreground">
          <Home size={11} aria-hidden="true" />
          {formatKm(nearestHome.distanceToHome!)}
        </span>
      )}
      {nearestUniversity && (
        <span className="block-chip inline-flex items-center gap-1 bg-muted px-2 py-0.5 text-[11px] font-extrabold text-foreground">
          <GraduationCap size={11} aria-hidden="true" />
          {formatKm(nearestUniversity.distanceToUniversity!)}
        </span>
      )}
      {entry.locations.length > 1 && (
        <span className="text-[11px] font-bold text-muted-foreground">
          {entry.locations.length} locations
        </span>
      )}
    </div>
  );
}
