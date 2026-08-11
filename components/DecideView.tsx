"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Dices, RotateCcw, Sparkles } from "lucide-react";
import {
  categoriesForMode,
  type Entry,
  type Mode,
  MODES,
} from "@/lib/types";
import { collectVibeTags } from "@/lib/vibes";
import VibeTag from "@/components/VibeTag";
import ResultTicket from "@/components/ResultTicket";

type ModeFilter = "Either" | Mode;
type Status = "idle" | "shuffling" | "revealed";

const SHUFFLE_MS = 550;

export default function DecideView({
  initialEntries,
}: {
  initialEntries: Entry[];
}) {
  const entries = initialEntries;
  const availableVibes = useMemo(() => collectVibeTags(entries), [entries]);

  const [mode, setMode] = useState<ModeFilter>("Either");
  const [category, setCategory] = useState<string | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  const [status, setStatus] = useState<Status>("idle");
  const [pool, setPool] = useState<Entry[]>([]);
  const [result, setResult] = useState<Entry | null>(null);

  const categoryOptions = mode === "Either" ? [] : categoriesForMode(mode);

  const matches = useMemo(() => {
    return entries.filter((entry) => {
      if (mode !== "Either" && entry.mode !== mode) return false;
      if (category && entry.category !== category) return false;
      if (!selectedVibes.every((v) => entry.vibes.includes(v))) return false;
      return true;
    });
  }, [entries, mode, category, selectedVibes]);

  // Filters changed: the previous pick may no longer be a valid match.
  // Adjusting state during render (React's recommended alternative to an
  // effect here) avoids an extra commit just to clear stale results.
  const filtersKey = `${mode}|${category}|${selectedVibes.join(",")}`;
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
    <div className="px-5 pt-6 pb-10 space-y-6">
      {/* Filters */}
      <section className="card-stock rounded-xl p-4 space-y-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Mode
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {(["Either", ...MODES] as ModeFilter[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleModeSelect(m)}
                className={`cursor-pointer rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                  mode === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Category
          </p>
          {mode === "Either" ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
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
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
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
      </section>

      {/* Decide action */}
      <section className="text-center space-y-4">
        {hasNoMatches ? (
          <div className="card-stock rounded-xl border-dashed p-6">
            <p className="font-hand text-2xl text-muted-foreground">
              Nothing matches those filters yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Loosen a filter, or{" "}
              <Link href="/catalog" className="font-semibold text-primary underline">
                add something to the Catalog
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {matches.length} option{matches.length === 1 ? "" : "s"} match
            </p>
            <button
              type="button"
              onClick={handleDecide}
              disabled={status === "shuffling"}
              className="group mx-auto flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-full border-4 border-primary-foreground/20 bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:cursor-wait"
            >
              <Dices
                size={36}
                className={status === "shuffling" ? "animate-shuffle" : ""}
                aria-hidden="true"
              />
              <span className="font-display text-lg leading-tight px-2">
                Decide For Us
              </span>
            </button>
          </>
        )}
      </section>

      {/* Result */}
      {status === "revealed" && result && (
        <section className="space-y-4">
          <ResultTicket key={result.id} entry={result} />
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handlePullAgain}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/50"
            >
              <RotateCcw size={15} aria-hidden="true" />
              Pull Again
            </button>
          </div>
        </section>
      )}

      {status === "idle" && !hasNoMatches && !result && (
        <p className="flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
          <Sparkles size={14} aria-hidden="true" />
          Your pick will land here
        </p>
      )}
    </div>
  );
}
