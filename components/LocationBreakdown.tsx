import { MapPin, Home, GraduationCap } from "lucide-react";
import type { EntryLocation, Settings } from "@/lib/types";
import { formatKm, nearestBy, withDistances } from "@/lib/geo";

export default function LocationBreakdown({
  locations,
  settings,
}: {
  locations: EntryLocation[];
  settings: Settings;
}) {
  const hasReference = Boolean(settings.home?.geo || settings.university?.geo);
  const distances = withDistances(locations, settings);
  const nearestHome = nearestBy(distances, "distanceToHome");
  const nearestUniversity = nearestBy(distances, "distanceToUniversity");

  return (
    <div className="mt-3 space-y-1.5">
      {distances.map((loc) => (
        <div
          key={loc.address}
          className="block-chip flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-card px-3 py-1.5 text-left"
        >
          <span className="flex items-center gap-1.5 text-xs font-extrabold text-foreground">
            <MapPin size={12} aria-hidden="true" />
            {loc.address}
          </span>
          {hasReference && (
            <span className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
              {loc.distanceToHome !== null && (
                <span
                  className="flex items-center gap-0.5"
                  style={
                    loc === nearestHome ? { color: "var(--color-eatin)" } : undefined
                  }
                >
                  <Home size={11} aria-hidden="true" />
                  {formatKm(loc.distanceToHome)}
                </span>
              )}
              {loc.distanceToUniversity !== null && (
                <span
                  className="flex items-center gap-0.5"
                  style={
                    loc === nearestUniversity
                      ? { color: "var(--color-eatin)" }
                      : undefined
                  }
                >
                  <GraduationCap size={11} aria-hidden="true" />
                  {formatKm(loc.distanceToUniversity)}
                </span>
              )}
              {loc.geo === null && "location not found"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
