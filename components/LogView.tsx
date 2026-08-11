"use client";

import { useMemo, useState } from "react";
import { Flame, Plus, Trash2 } from "lucide-react";
import { formatMonthLabel } from "@/lib/dates";
import { computeStreak } from "@/lib/streak";
import { DEFAULT_CURRENCY, type Entry, type LogEntry, type LogEntryInput, type Settings } from "@/lib/types";
import ModeBadge from "@/components/ModeBadge";
import LogMealModal from "@/components/LogMealModal";

export default function LogView({
  initialLog,
  entries,
  settings,
}: {
  initialLog: LogEntry[];
  entries: Entry[];
  settings: Settings;
}) {
  const [log, setLog] = useState<LogEntry[]>(initialLog);
  const [modalOpen, setModalOpen] = useState(false);
  const currency = settings.currency ?? DEFAULT_CURRENCY;

  const streak = useMemo(() => computeStreak(log.map((e) => e.date)), [log]);

  const monthGroups = useMemo(() => {
    const map = new Map<string, LogEntry[]>();
    for (const entry of log) {
      const key = entry.date.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [log]);

  async function handleAdd(input: LogEntryInput) {
    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Could not save.");
    }
    const created: LogEntry = await res.json();
    setLog((prev) =>
      [...prev, created].sort(
        (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
      ),
    );
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this from your history?")) return;
    const res = await fetch(`/api/log/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLog((prev) => prev.filter((e) => e.id !== id));
    }
  }

  return (
    <div className="px-4 pt-6 pb-10 space-y-5">
      <section className="block-panel flex items-center justify-center gap-3 p-4">
        <Flame
          size={30}
          className={streak > 0 ? "fill-primary text-primary" : "text-muted-foreground"}
          aria-hidden="true"
        />
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-foreground">
            {streak}-day streak
          </p>
          <p className="text-xs font-bold text-muted-foreground">
            Log a meal each day to keep it going
          </p>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="block-btn flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-extrabold text-accent-foreground"
      >
        <Plus size={18} aria-hidden="true" />
        Log a Meal
      </button>

      <section className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          Monthly Spend
        </p>
        {monthGroups.length === 0 ? (
          <p className="text-sm font-bold text-muted-foreground">
            Log a few meals with amounts to see monthly totals here.
          </p>
        ) : (
          <div className="space-y-1.5">
            {monthGroups.slice(0, 6).map(([key, monthEntries]) => {
              const total = monthEntries.reduce((sum, e) => sum + (e.amount ?? 0), 0);
              return (
                <div
                  key={key}
                  className="block-chip flex items-center justify-between bg-card px-3 py-2"
                >
                  <span className="font-display font-bold text-foreground">
                    {formatMonthLabel(`${key}-01`)}
                  </span>
                  <span className="text-sm font-extrabold text-foreground">
                    {currency}
                    {total.toFixed(2)} · {monthEntries.length} meal
                    {monthEntries.length === 1 ? "" : "s"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
          History
        </p>
        {log.length === 0 ? (
          <p
            style={{ borderStyle: "dashed" }}
            className="block-panel p-6 text-center font-display text-2xl font-bold text-muted-foreground"
          >
            Nothing logged yet.
          </p>
        ) : (
          <div className="space-y-2">
            {log.map((entry) => (
              <div
                key={entry.id}
                className="block-panel flex items-center justify-between gap-2 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-display font-bold text-foreground">
                    {entry.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <ModeBadge mode={entry.mode} className="px-2 py-0.5 text-[10px]" />
                    <span className="text-xs font-bold text-muted-foreground">
                      {entry.date}
                    </span>
                    {entry.amount != null && (
                      <span className="text-xs font-extrabold text-foreground">
                        {currency}
                        {entry.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  aria-label={`Remove ${entry.name} from history`}
                  className="block-btn shrink-0 rounded-full bg-card p-1.5 text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {modalOpen && (
        <LogMealModal
          entries={entries}
          currency={currency}
          onSubmit={handleAdd}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
