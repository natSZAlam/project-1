import { MapPin, Bike as BikeIcon, Star } from "lucide-react";
import type { Entry, Settings } from "@/lib/types";
import ModeBadge from "./ModeBadge";
import VibeTag from "./VibeTag";
import DistanceBadges from "./DistanceBadges";
import LocationBreakdown from "./LocationBreakdown";

export default function ResultTicket({
  entry,
  settings,
}: {
  entry: Entry;
  settings: Settings;
}) {
  const locations = entry.locations ?? [];

  return (
    <div className="animate-pop-in block-panel mx-auto w-full max-w-md overflow-hidden">
      <div className="flex items-center justify-center gap-1.5 border-b-[3px] border-foreground bg-secondary py-2">
        <Star size={16} className="fill-foreground" aria-hidden="true" />
        <p className="stamp text-sm font-bold text-secondary-foreground">
          Tonight&apos;s Pick!
        </p>
        <Star size={16} className="fill-foreground" aria-hidden="true" />
      </div>

      <div className="px-6 pt-5 pb-6">
        <h2 className="text-center font-display text-3xl font-bold text-primary">
          {entry.name}
        </h2>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <ModeBadge mode={entry.mode} />
          <span className="block-chip bg-muted px-2.5 py-1 text-xs font-extrabold text-foreground">
            {entry.category}
          </span>
        </div>

        {entry.mode === "Eat Out" && locations.length === 1 && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold text-muted-foreground">
            <MapPin size={15} aria-hidden="true" />
            {locations[0].address}
          </p>
        )}

        {entry.mode === "Order In" && entry.deliveryApp && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold text-muted-foreground">
            <BikeIcon size={15} aria-hidden="true" />
            {entry.deliveryApp}
          </p>
        )}

        {entry.mode === "Eat Out" && locations.length > 0 && (
          <div className="mt-3 flex justify-center">
            <DistanceBadges entry={entry} settings={settings} />
          </div>
        )}

        {entry.mode === "Eat Out" && locations.length > 1 && (
          <LocationBreakdown locations={locations} settings={settings} />
        )}

        {entry.goTo && (
          <div className="mt-4 rounded-2xl border-[3px] border-foreground bg-accent/10 px-4 py-3 text-center">
            <p className="text-xs font-extrabold uppercase tracking-wide text-accent">
              {entry.mode === "Eat In" ? "What to cook" : "Go-to order"}
            </p>
            <p className="mt-1 font-display text-lg font-semibold leading-snug text-foreground">
              {entry.goTo}
            </p>
          </div>
        )}

        {entry.vibes.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {entry.vibes.map((vibe) => (
              <VibeTag key={vibe} label={vibe} />
            ))}
          </div>
        )}

        {entry.notes && (
          <p className="mt-4 border-t-[3px] border-dashed border-foreground/30 pt-3 text-center text-sm font-bold text-muted-foreground">
            {entry.notes}
          </p>
        )}
      </div>
    </div>
  );
}
