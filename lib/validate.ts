import { MODES, categoriesForMode, type EntryInput } from "./types";

export function parseEntryInput(body: unknown): EntryInput {
  if (typeof body !== "object" || body === null) {
    throw new Error("Invalid request body");
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) throw new Error("Name is required");

  const mode = b.mode;
  if (typeof mode !== "string" || !MODES.includes(mode as (typeof MODES)[number])) {
    throw new Error("A valid mode is required");
  }

  const validCategories = categoriesForMode(mode as (typeof MODES)[number]);
  const category = typeof b.category === "string" ? b.category : "";
  if (!validCategories.includes(category)) {
    throw new Error(`Category must be one of: ${validCategories.join(", ")}`);
  }

  const vibes = Array.isArray(b.vibes)
    ? b.vibes.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    : [];

  const entry: EntryInput = {
    name,
    mode: mode as (typeof MODES)[number],
    category,
    vibes,
    goTo: typeof b.goTo === "string" ? b.goTo.trim() : undefined,
    notes: typeof b.notes === "string" ? b.notes.trim() : undefined,
    location:
      mode === "Eat Out" && typeof b.location === "string"
        ? b.location.trim()
        : undefined,
    deliveryApp:
      mode === "Order In" && typeof b.deliveryApp === "string"
        ? b.deliveryApp.trim()
        : undefined,
  };

  return entry;
}
