import { MapPin, Bike as BikeIcon, UtensilsCrossed } from "lucide-react";
import type { Entry } from "@/lib/types";
import ModeBadge from "./ModeBadge";
import VibeTag from "./VibeTag";

export default function ResultTicket({ entry }: { entry: Entry }) {
  return (
    <div className="ticket-edge card-stock animate-card-pop mx-auto w-full max-w-md rounded-xl px-6 pt-7 pb-6">
      <p className="stamp text-center text-xs font-bold text-accent">
        Tonight&apos;s Pick
      </p>
      <h2 className="mt-1 text-center font-display text-3xl text-primary">
        {entry.name}
      </h2>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <ModeBadge mode={entry.mode} />
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {entry.category}
        </span>
      </div>

      {(entry.location || entry.deliveryApp) && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          {entry.mode === "Eat Out" ? (
            <MapPin size={15} aria-hidden="true" />
          ) : (
            <BikeIcon size={15} aria-hidden="true" />
          )}
          {entry.location || entry.deliveryApp}
        </p>
      )}

      {entry.goTo && (
        <div className="perforation my-4" />
      )}

      {entry.goTo && (
        <p className="text-center">
          <span className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary">
            <UtensilsCrossed size={13} aria-hidden="true" />
            {entry.mode === "Eat In" ? "What to cook" : "Go-to order"}
          </span>
          <span className="mt-1 block font-hand text-2xl leading-snug text-foreground">
            {entry.goTo}
          </span>
        </p>
      )}

      {entry.vibes.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {entry.vibes.map((vibe) => (
            <VibeTag key={vibe} label={vibe} />
          ))}
        </div>
      )}

      {entry.notes && (
        <p className="mt-4 border-t border-dashed border-border pt-3 text-center text-sm text-muted-foreground italic">
          {entry.notes}
        </p>
      )}
    </div>
  );
}
