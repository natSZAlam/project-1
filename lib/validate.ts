import { MODES, categoriesForMode, type Mode } from "./types";

/** Uploaded photos only ever live at /uploads/<uuid>.<ext> (see
 * app/api/upload/route.ts) — reject anything else so this field can't be
 * used to smuggle in an arbitrary URL or path. */
const PHOTO_PATH_PATTERN = /^\/uploads\/[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|gif)$/;

/** What the client can send us for an entry: everything except `locations`,
 * which arrives as raw address strings and gets geocoded server-side by the
 * route handler (kept out of this pure-validation module on purpose). */
export interface RawEntryInput {
  name: string;
  mode: Mode;
  category: string;
  vibes: string[];
  goTo?: string;
  notes?: string;
  deliveryApp?: string;
  locationAddresses?: string[];
  photo?: string;
}

export function parseEntryInput(body: unknown): RawEntryInput {
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

  const locationAddresses =
    mode === "Eat Out" && Array.isArray(b.locations)
      ? b.locations
          .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
          .map((v) => v.trim())
      : undefined;

  return {
    name,
    mode: mode as (typeof MODES)[number],
    category,
    vibes,
    goTo: typeof b.goTo === "string" ? b.goTo.trim() || undefined : undefined,
    notes: typeof b.notes === "string" ? b.notes.trim() || undefined : undefined,
    deliveryApp:
      mode === "Order In" && typeof b.deliveryApp === "string"
        ? b.deliveryApp.trim() || undefined
        : undefined,
    locationAddresses,
    photo:
      typeof b.photo === "string" && PHOTO_PATH_PATTERN.test(b.photo)
        ? b.photo
        : undefined,
  };
}
