"use client";

import { useState } from "react";
import { toISODate } from "@/lib/dates";
import { DEFAULT_CURRENCY, MODES, type Entry, type LogEntryInput, type Mode } from "@/lib/types";
import Modal from "@/components/Modal";

export default function LogMealModal({
  entries,
  currency,
  onSubmit,
  onClose,
}: {
  entries: Entry[];
  currency: string | undefined;
  onSubmit: (input: LogEntryInput) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [entryId, setEntryId] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<Mode>("Eat In");
  const [date, setDate] = useState(toISODate(new Date()));
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions =
    name.trim().length > 0
      ? entries
          .filter(
            (e) => e.name.toLowerCase().includes(name.trim().toLowerCase()) && e.name !== name,
          )
          .slice(0, 6)
      : [];

  function handleNameChange(value: string) {
    setName(value);
    setEntryId(undefined);
  }

  function pick(entry: Entry) {
    setName(entry.name);
    setEntryId(entry.id);
    setMode(entry.mode);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        mode,
        date,
        entryId,
        amount: amount.trim() ? parseFloat(amount) : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <Modal title="Log a Meal" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="log-name"
            className="block text-xs font-bold uppercase tracking-wide text-muted-foreground"
          >
            What did you eat?
          </label>
          <input
            id="log-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Search your catalog or type anything"
            className="mt-1.5 w-full rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
          />
          {suggestions.length > 0 && (
            <div className="mt-1.5 space-y-1">
              {suggestions.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => pick(entry)}
                  className="block-chip block-chip-interactive block w-full bg-muted px-3 py-1.5 text-left text-sm font-bold text-foreground"
                >
                  {entry.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Mode
          </p>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="block-chip px-2 py-2 text-xs font-extrabold"
                style={{
                  backgroundColor: mode === m ? "var(--color-primary)" : "var(--color-card)",
                  color: mode === m ? "#FFFFFF" : "var(--color-foreground)",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="log-date"
              className="block text-xs font-bold uppercase tracking-wide text-muted-foreground"
            >
              Date
            </label>
            <input
              id="log-date"
              type="date"
              value={date}
              max={toISODate(new Date())}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
            />
          </div>
          <div>
            <label
              htmlFor="log-amount"
              className="block text-xs font-bold uppercase tracking-wide text-muted-foreground"
            >
              Spent ({currency ?? DEFAULT_CURRENCY})
            </label>
            <input
              id="log-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="optional"
              className="mt-1.5 w-full rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
            />
          </div>
        </div>

        {error && (
          <p className="block-chip bg-destructive px-3 py-2 text-sm font-extrabold text-destructive-foreground">
            {error}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="block-btn flex-1 rounded-2xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground disabled:cursor-wait"
          >
            {saving ? "Saving..." : "Log It"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="block-btn rounded-2xl bg-card px-4 py-2.5 text-sm font-extrabold text-foreground"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
