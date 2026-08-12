"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";
import {
  COOK_TIMES,
  categoriesForMode,
  MODES,
  type CookTime,
  type Entry,
  type EntryDraft,
  type EntryPrefill,
  type Mode,
  type WeeklyHours,
} from "@/lib/types";
import VibeTag from "@/components/VibeTag";
import HoursEditor from "@/components/HoursEditor";

const DELIVERY_APP_SUGGESTIONS = [
  "DoorDash",
  "Uber Eats",
  "Grubhub",
  "Postmates",
];

export default function EntryForm({
  initial,
  prefill,
  availableVibes,
  onSubmit,
  onCancel,
  onDelete,
}: {
  initial?: Entry;
  /** Only consulted when `initial` is absent (i.e. creating fresh) — seeds
   * the form from a Quick Add import instead of blank defaults. */
  prefill?: EntryPrefill;
  availableVibes: string[];
  onSubmit: (input: EntryDraft) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const startMode = initial?.mode ?? prefill?.mode ?? "Eat In";

  const [name, setName] = useState(initial?.name ?? prefill?.name ?? "");
  const [photo, setPhoto] = useState(initial?.photo);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>(startMode);
  const [category, setCategory] = useState<string>(
    initial?.category ?? prefill?.category ?? categoriesForMode(startMode)[0],
  );
  const [locations, setLocations] = useState<string[]>(
    initial?.locations?.map((l) => l.address) ??
      prefill?.locations ??
      (startMode === "Eat Out" ? [""] : []),
  );
  const [deliveryApp, setDeliveryApp] = useState(initial?.deliveryApp ?? "");
  const [ingredients, setIngredients] = useState(
    (initial?.ingredients ?? []).join(", "),
  );
  const [cookTime, setCookTime] = useState<CookTime | undefined>(initial?.cookTime);
  const [hours, setHours] = useState<WeeklyHours | undefined>(initial?.hours);
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
    if (next === "Eat Out" && locations.length === 0) {
      setLocations([""]);
    }
  }

  function updateLocationAt(index: number, value: string) {
    setLocations((prev) => prev.map((l, i) => (i === index ? value : l)));
  }

  function addLocationRow() {
    setLocations((prev) => [...prev, ""]);
  }

  function removeLocationRow(index: number) {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  }

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not upload photo.");
      }
      const { path } = (await res.json()) as { path: string };
      setPhoto(path);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not upload photo.");
    } finally {
      setUploading(false);
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
        locations:
          mode === "Eat Out"
            ? locations.map((l) => l.trim()).filter(Boolean)
            : undefined,
        deliveryApp:
          mode === "Order In" ? deliveryApp.trim() || undefined : undefined,
        ingredients:
          mode === "Eat In"
            ? ingredients
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean)
            : undefined,
        cookTime: mode === "Eat In" ? cookTime : undefined,
        hours: mode !== "Eat In" ? hours : undefined,
        goTo: goTo.trim() || undefined,
        vibes,
        notes: notes.trim() || undefined,
        photo,
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
          className="mt-1.5 w-full rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
        />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Photo
        </p>
        {photo ? (
          <div className="relative mt-1.5 overflow-hidden rounded-2xl border-[3px] border-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded local file, no known dimensions for next/image */}
            <img src={photo} alt="" className="block max-h-56 w-full object-cover" />
            <button
              type="button"
              onClick={() => setPhoto(undefined)}
              aria-label="Remove photo"
              className="block-btn absolute right-2 top-2 rounded-full bg-card p-1.5 text-foreground"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label
            style={{ borderStyle: "dashed" }}
            className="block-btn mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl bg-muted py-6 text-muted-foreground"
          >
            {uploading ? (
              <Loader2 size={22} className="animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus size={22} aria-hidden="true" />
            )}
            <span className="text-xs font-extrabold">
              {uploading ? "Uploading..." : "Add a photo"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handlePhotoSelect}
              disabled={uploading}
              className="sr-only"
            />
          </label>
        )}
        {uploadError && (
          <p className="mt-1.5 text-xs font-bold text-destructive">{uploadError}</p>
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
              onClick={() => handleModeChange(m)}
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

      {mode === "Eat In" && (
        <div>
          <label
            htmlFor="entry-ingredients"
            className="block text-xs font-bold uppercase tracking-wide text-muted-foreground"
          >
            Ingredients
          </label>
          <input
            id="entry-ingredients"
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. eggs, spinach, cheddar, mushrooms"
            className="mt-1.5 w-full rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
          />
          <p className="mt-1.5 text-xs font-bold text-muted-foreground">
            Comma-separated. Powers the pantry filter on Decide — leave blank
            to skip it for this recipe.
          </p>
        </div>
      )}

      {mode === "Eat In" && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Cook Time
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <VibeTag
              as="button"
              label="Not set"
              selected={!cookTime}
              onClick={() => setCookTime(undefined)}
            />
            {COOK_TIMES.map((ct) => (
              <VibeTag
                key={ct}
                as="button"
                label={ct}
                selected={cookTime === ct}
                onClick={() => setCookTime(ct)}
              />
            ))}
          </div>
          <p className="mt-1.5 text-xs font-bold text-muted-foreground">
            Lets you filter for a quick meal on a tired night.
          </p>
        </div>
      )}

      {mode === "Eat Out" && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Location{locations.length > 1 ? "s" : ""}
          </p>
          <div className="mt-1.5 space-y-2">
            {locations.map((loc, i) => (
              <div key={i} className="flex gap-1.5">
                <input
                  type="text"
                  value={loc}
                  onChange={(e) => updateLocationAt(i, e.target.value)}
                  placeholder="e.g. 12 Vine St, Warsaw"
                  aria-label={`Location ${i + 1}`}
                  className="flex-1 rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
                />
                {locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLocationRow(i)}
                    aria-label="Remove location"
                    className="block-btn rounded-2xl bg-card px-3 text-foreground"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLocationRow}
            className="block-btn mt-2 inline-flex items-center gap-1.5 rounded-2xl bg-muted px-3 py-1.5 text-xs font-extrabold text-foreground"
          >
            <Plus size={14} aria-hidden="true" />
            Add another location
          </button>
          <p className="mt-1.5 text-xs font-bold text-muted-foreground">
            We&apos;ll estimate straight-line distance to your home &amp;
            university once saved.
          </p>
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
            className="mt-1.5 w-full rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
          />
          <datalist id="delivery-app-suggestions">
            {DELIVERY_APP_SUGGESTIONS.map((app) => (
              <option key={app} value={app} />
            ))}
          </datalist>
        </div>
      )}

      {mode !== "Eat In" && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Hours
          </p>
          <div className="mt-1.5">
            <HoursEditor value={hours} onChange={setHours} />
          </div>
          <p className="mt-1.5 text-xs font-bold text-muted-foreground">
            Optional — when set, Decide skips this place while it&apos;s
            closed.
          </p>
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
          className="mt-1.5 w-full rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
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
            className="flex-1 rounded-2xl border-[3px] border-foreground bg-card px-3 py-1.5 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
          />
          <button
            type="button"
            onClick={addCustomTag}
            className="block-btn rounded-2xl bg-secondary px-3 py-1.5 text-secondary-foreground"
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
          className="mt-1.5 w-full rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
        />
      </div>

      {error && (
        <p className="block-chip bg-destructive px-3 py-2 text-sm font-extrabold text-destructive-foreground">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={saving || uploading}
          className="block-btn flex-1 rounded-2xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"
        >
          {saving ? "Saving..." : initial ? "Save Changes" : "Add Entry"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="block-btn rounded-2xl bg-card px-4 py-2.5 text-sm font-extrabold text-foreground"
        >
          Cancel
        </button>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="block-btn w-full rounded-2xl bg-destructive px-4 py-2 text-sm font-extrabold text-destructive-foreground"
        >
          Delete Entry
        </button>
      )}
    </form>
  );
}
