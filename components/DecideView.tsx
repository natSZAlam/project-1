"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HelpCircle, RotateCcw, Sparkles } from "lucide-react";
import {
  categoriesForMode,
  type Entry,
  type Mode,
  type PantryState,
  type Settings,
  MODES,
} from "@/lib/types";
import { collectVibeTags } from "@/lib/vibes";
import VibeTag from "@/components/VibeTag";
import ResultTicket from "@/components/ResultTicket";
import StarBurst from "@/components/StarBurst";
import PantryButton from "@/components/PantryButton";

type ModeFilter = "Either" | Mode;
type Status = "idle" | "shuffling" | "revealed";

const SHUFFLE_MS = 600;

const MODE_FILTER_COLOR: Record<ModeFilter, string> = {
  Either: "var(--color-primary)",
  "Eat In": "var(--color-eatin)",
  "Eat Out": "var(--color-eatout)",
  "Order In": "var(--color-orderin)",
};

export default function DecideView({
  initialEntries,
  settings,
  pantry,
}: {
  initialEntries: Entry[];
  settings: Settings;
  pantry: PantryState;
}) {
  const entries = initialEntries;
  const availableVibes = useMemo(() => collectVibeTags(entries), [entries]);

  const [mode, setMode] = useState<ModeFilter>("Either");
  const [category, setCategory] = useState<string | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [pantryItems, setPantryItems] = useState<string[]>(pantry.items);
  const [pantryOnly, setPantryOnly] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [pool, setPool] = useState<Entry[]>([]);
  const [result, setResult] = useState<Entry | null>(null);

  const categoryOptions = mode === "Either" ? [] : categoriesForMode(mode);

  const matches = useMemo(() => {
    const pantryLower = pantryItems.map((i) => i.toLowerCase());
    return entries.filter((entry) => {
      if (mode !== "Either" && entry.mode !== mode) return false;
      if (category && entry.category !== category) return false;
      if (!selectedVibes.every((v) => entry.vibes.includes(v))) return false;
      if (pantryOnly) {
        if (entry.mode !== "Eat In") return false;
        const needed = entry.ingredients ?? [];
        if (needed.length === 0) return false;
        if (!needed.every((ing) => pantryLower.includes(ing.toLowerCase()))) return false;
      }
      return true;
    });
  }, [entries, mode, category, selectedVibes, pantryOnly, pantryItems]);

  // Filters changed: the previous pick may no longer be a valid match.
  // Adjusting state during render (React's recommended alternative to an
  // effect here) avoids an extra commit just to clear stale results.
  const filtersKey = `${mode}|${category}|${selectedVibes.join(",")}|${pantryOnly}`;
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setStatus("idle");
    setResult(null);
  }

  function handleModeSelect(next: ModeFilter) {
    setMode(next);
    setCategory(null);
  }

  function toggleVibe(vibe: string) {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe],
    );
  }

  function pickFrom(candidates: Entry[], avoidId?: string): Entry {
    if (candidates.length === 1) return candidates[0];
    let pick: Entry;
    do {
      pick = candidates[Math.floor(Math.random() * candidates.length)];
    } while (pick.id === avoidId);
    return pick;
  }

  function handleDecide() {
    if (matches.length === 0) return;
    setPool(matches);
    setStatus("shuffling");
    window.setTimeout(() => {
      setResult(pickFrom(matches));
      setStatus("revealed");
    }, SHUFFLE_MS);
  }

  function handlePullAgain() {
    if (pool.length === 0) return;
    setStatus("shuffling");
    window.setTimeout(() => {
      setResult((prev) => pickFrom(pool, prev?.id));
      setStatus("revealed");
    }, SHUFFLE_MS - 150);
  }

  const hasNoMatches = matches.length === 0;

  return (
    <div className="px-4 pt-6 pb-10 space-y-6">
      {/* Filters */}
      <section className="block-panel space-y-4 p-4">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
            Mode
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {(["Either", ...MODES] as ModeFilter[]).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleModeSelect(m)}
                  className="block-chip px-2 py-2 text-xs font-extrabold"
                  style={{
                    backgroundColor: active ? MODE_FILTER_COLOR[m] : "var(--color-card)",
                    color: active ? "#FFFFFF" : "var(--color-foreground)",
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
            Category
          </p>
          {mode === "Either" ? (
            <p className="rounded-2xl border-[3px] border-dashed border-foreground/30 bg-muted px-3 py-2 text-sm font-bold text-muted-foreground">
              Pick a mode above to filter by category.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <VibeTag
                as="button"
                label="Any"
                selected={category === null}
                onClick={() => setCategory(null)}
              />
              {categoryOptions.map((c) => (
                <VibeTag
                  key={c}
                  as="button"
                  label={c}
                  selected={category === c}
                  onClick={() => setCategory(c)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
            Vibe
          </p>
          <div className="flex flex-wrap gap-1.5">
            {availableVibes.map((vibe) => (
              <VibeTag
                key={vibe}
                as="button"
                label={vibe}
                selected={selectedVibes.includes(vibe)}
                onClick={() => toggleVibe(vibe)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
            Pantry
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <PantryButton items={pantryItems} onChange={setPantryItems} />
            <VibeTag
              as="button"
              label="Only what I can make"
              selected={pantryOnly}
              onClick={() => setPantryOnly((v) => !v)}
            />
          </div>
          {pantryOnly && pantryItems.length === 0 && (
            <p className="mt-1.5 text-xs font-bold text-muted-foreground">
              Your pantry is empty — add what you&apos;ve got and Eat In
              recipes you can fully make will show up here.
            </p>
          )}
        </div>
      </section>

      {/* Decide action */}
      <section className="text-center space-y-5">
        {hasNoMatches ? (
          <div style={{ borderStyle: "dashed" }} className="block-panel p-6">
            <p className="font-display text-2xl font-bold text-muted-foreground">
              Nothing matches those filters yet!
            </p>
            <p className="mt-2 text-sm font-bold text-muted-foreground">
              Loosen a filter, or{" "}
              <Link href="/catalog" className="font-extrabold text-primary underline">
                add something to the Catalog
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <span className="block-chip inline-block bg-secondary px-3 py-1 text-xs font-extrabold text-secondary-foreground">
              {matches.length} option{matches.length === 1 ? "" : "s"} in play
            </span>

            <div className="flex justify-center py-2">
              <button
                type="button"
                onClick={handleDecide}
                disabled={status === "shuffling"}
                className={`block-btn relative flex h-44 w-44 flex-col items-center justify-center gap-1 rounded-[28px] bg-secondary text-secondary-foreground disabled:cursor-wait ${
                  status === "shuffling" ? "animate-qblock-shuffle" : "animate-qblock-idle"
                }`}
              >
                <span
                  className="absolute h-3 w-3 rounded-full bg-foreground/70"
                  style={{ top: 10, left: 10 }}
                  aria-hidden="true"
                />
                <span
                  className="absolute h-3 w-3 rounded-full bg-foreground/70"
                  style={{ top: 10, right: 10 }}
                  aria-hidden="true"
                />
                <span
                  className="absolute h-3 w-3 rounded-full bg-foreground/70"
                  style={{ bottom: 10, left: 10 }}
                  aria-hidden="true"
                />
                <span
                  className="absolute h-3 w-3 rounded-full bg-foreground/70"
                  style={{ bottom: 10, right: 10 }}
                  aria-hidden="true"
                />
                <HelpCircle
                  size={48}
                  strokeWidth={2.75}
                  aria-hidden="true"
                />
                <span className="font-display text-lg font-bold leading-tight px-2">
                  Decide For Us
                </span>
              </button>
            </div>
          </>
        )}
      </section>

      {/* Result */}
      {status === "revealed" && result && (
        <section className="relative space-y-4">
          <StarBurst key={`burst-${result.id}`} />
          <ResultTicket key={result.id} entry={result} settings={settings} />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handlePullAgain}
              className="block-btn inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-extrabold text-accent-foreground"
            >
              <RotateCcw size={15} aria-hidden="true" />
              Pull Again
            </button>
          </div>
        </section>
      )}

      {status === "idle" && !hasNoMatches && !result && (
        <p className="flex items-center justify-center gap-1.5 text-center text-sm font-bold text-muted-foreground">
          <Sparkles size={14} aria-hidden="true" />
          Tap the block to see what&apos;s for dinner
        </p>
      )}
    </div>
  );
}
