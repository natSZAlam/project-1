"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  categoriesForMode,
  MODES,
  type Entry,
  type EntryInput,
  type Mode,
} from "@/lib/types";
import VibeTag from "@/components/VibeTag";

const DELIVERY_APP_SUGGESTIONS = [
  "DoorDash",
  "Uber Eats",
  "Grubhub",
  "Postmates",
];

export default function EntryForm({
  initial,
  availableVibes,
  onSubmit,
  onCancel,
  onDelete,
}: {
  initial?: Entry;
  availableVibes: string[];
  onSubmit: (input: EntryInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [mode, setMode] = useState<Mode>(initial?.mode ?? "Eat In");
  const [category, setCategory] = useState<string>(
    initial?.category ?? categoriesForMode(initial?.mode ?? "Eat In")[0],
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [deliveryApp, setDeliveryApp] = useState(initial?.deliveryApp ?? "");
  const [goTo, setGoTo] = useState(initial?.goTo ?? "");
  const [vibes, setVibes] = useState<string[]>(initial?.vibes ?? []);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categoryOptions = categoriesForMode(mode);
  const allVibeOptions = [
    ...availableVibes,
    ...customTags.filter((t) => !availableVibes.includes(t)),
  ];

  function handleModeChange(next: Mode) {
    setMode(next);
    const options = categoriesForMode(next);
    if (!options.includes(category)) {
      setCategory(options[0]);
    }
  }

  function toggleVibe(vibe: string) {
    setVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe],
    );
  }

  function addCustomTag() {
    const tag = newTag.trim();
    if (!tag) return;
    if (!allVibeOptions.includes(tag)) {
      setCustomTags((prev) => [...prev, tag]);
    }
    setVibes((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setNewTag("");
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
        category,
        location: mode === "Eat Out" ? location.trim() || undefined : undefined,
        deliveryApp:
          mode === "Order In" ? deliveryApp.trim() || undefined : undefined,
        goTo: goTo.trim() || undefined,
        vibes,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="entry-name" className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Name
        </label>
        <input
          id="entry-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Trattoria Bella"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
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
              onClick={() => handleModeChange(m)}
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
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Category
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
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
      </div>

      {mode === "Eat Out" && (
        <div>
          <label htmlFor="entry-location" className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Location
          </label>
          <input
            id="entry-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. 12 Vine St"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {mode === "Order In" && (
        <div>
          <label htmlFor="entry-app" className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Delivery App
          </label>
          <input
            id="entry-app"
            type="text"
            list="delivery-app-suggestions"
            value={deliveryApp}
            onChange={(e) => setDeliveryApp(e.target.value)}
            placeholder="e.g. DoorDash"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <datalist id="delivery-app-suggestions">
            {DELIVERY_APP_SUGGESTIONS.map((app) => (
              <option key={app} value={app} />
            ))}
          </datalist>
        </div>
      )}

      <div>
        <label htmlFor="entry-goto" className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {mode === "Eat In" ? "What you'd cook" : "Go-to order"}
        </label>
        <textarea
          id="entry-goto"
          value={goTo}
          onChange={(e) => setGoTo(e.target.value)}
          rows={2}
          placeholder={
            mode === "Eat In"
              ? "e.g. Garlic butter steak with roasted potatoes"
              : "e.g. Truffle tagliatelle, split the tiramisu"
          }
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Vibe tags
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {allVibeOptions.map((vibe) => (
            <VibeTag
              key={vibe}
              as="button"
              label={vibe}
              selected={vibes.includes(vibe)}
              onClick={() => toggleVibe(vibe)}
            />
          ))}
        </div>
        <div className="mt-2 flex gap-1.5">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomTag();
              }
            }}
            placeholder="Add a custom tag..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={addCustomTag}
            className="cursor-pointer rounded-lg border border-border bg-muted px-3 py-1.5 text-muted-foreground hover:border-primary/50"
            aria-label="Add tag"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="entry-notes" className="block text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Notes
        </label>
        <textarea
          id="entry-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Anything else worth remembering"
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-secondary disabled:opacity-60"
        >
          {saving ? "Saving..." : initial ? "Save Changes" : "Add Entry"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:border-primary/50"
        >
          Cancel
        </button>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="w-full cursor-pointer rounded-lg border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
        >
          Delete Entry
        </button>
      )}
    </form>
  );
}
