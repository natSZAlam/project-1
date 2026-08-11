"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { formatDayLabel } from "@/lib/dates";
import { MODES, type Entry, type Mode, type PlannedMeal } from "@/lib/types";
import Modal from "@/components/Modal";
import ModeBadge from "@/components/ModeBadge";

export default function PlanPickerModal({
  date,
  entries,
  onAssign,
  onClose,
}: {
  date: string;
  entries: Entry[];
  onAssign: (meal: PlannedMeal) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [freeName, setFreeName] = useState("");
  const [freeMode, setFreeMode] = useState<Mode>("Eat In");

  const filtered = entries
    .filter((e) => e.name.toLowerCase().includes(search.trim().toLowerCase()))
    .slice(0, 25);

  // date is yyyy-mm-dd; parse in local time rather than via `new Date(iso)`
  // (which treats bare dates as UTC and can shift the displayed day).
  const [y, m, d] = date.split("-").map(Number);
  const dateLabel = formatDayLabel(new Date(y, m - 1, d));

  return (
    <Modal title={`Plan for ${dateLabel}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your catalog..."
            className="w-full rounded-2xl border-[3px] border-foreground bg-card py-2 pl-9 pr-3 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
          />
        </div>

        <div className="max-h-56 space-y-1.5 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-sm font-bold text-muted-foreground">No matches.</p>
          )}
          {filtered.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() =>
                onAssign({ date, entryId: entry.id, name: entry.name, mode: entry.mode })
              }
              className="block-btn flex w-full items-center justify-between gap-2 rounded-2xl bg-card px-3 py-2 text-left"
            >
              <span className="font-display font-bold text-foreground">{entry.name}</span>
              <ModeBadge mode={entry.mode} className="px-2 py-0.5 text-[10px]" />
            </button>
          ))}
        </div>

        <div style={{ borderStyle: "dashed" }} className="border-t-[3px] border-foreground/30 pt-3">
          <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
            Or just type it
          </p>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFreeMode(m)}
                className="block-chip px-2 py-1 text-[11px] font-extrabold"
                style={{
                  backgroundColor: freeMode === m ? "var(--color-primary)" : "var(--color-card)",
                  color: freeMode === m ? "#FFFFFF" : "var(--color-foreground)",
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="mt-1.5 flex gap-1.5">
            <input
              type="text"
              value={freeName}
              onChange={(e) => setFreeName(e.target.value)}
              placeholder="e.g. Leftovers"
              className="flex-1 rounded-2xl border-[3px] border-foreground bg-card px-3 py-1.5 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
            />
            <button
              type="button"
              disabled={!freeName.trim()}
              onClick={() => onAssign({ date, name: freeName.trim(), mode: freeMode })}
              className="block-btn rounded-2xl bg-secondary px-4 text-sm font-extrabold text-secondary-foreground disabled:opacity-50"
            >
              Set
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
