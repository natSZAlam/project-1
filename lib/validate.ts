import {
  COOK_TIMES,
  DAY_KEYS,
  MODES,
  categoriesForMode,
  type CookTime,
  type DayHours,
  type Mode,
  type WeeklyHours,
} from "./types";

/** Uploaded photos only ever live at /uploads/<uuid>.<ext> (see
 * app/api/upload/route.ts) — reject anything else so this field can't be
 * used to smuggle in an arbitrary URL or path. */
const PHOTO_PATH_PATTERN = /^\/uploads\/[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|gif)$/;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseWeeklyHours(value: unknown): WeeklyHours | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const raw = value as Record<string, unknown>;
  const hours: WeeklyHours = {};

  for (const day of DAY_KEYS) {
    const entry = raw[day];
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as Record<string, unknown>;
    const closed = e.closed === true;
    const open = typeof e.open === "string" && TIME_PATTERN.test(e.open) ? e.open : "11:00";
    const close = typeof e.close === "string" && TIME_PATTERN.test(e.close) ? e.close : "22:00";
    const dayHours: DayHours = { closed, open, close };
    hours[day] = dayHours;
  }

  return Object.keys(hours).length > 0 ? hours : undefined;
}

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
  ingredients?: string[];
  cookTime?: CookTime;
  hours?: WeeklyHours;
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
    ingredients:
      mode === "Eat In" && Array.isArray(b.ingredients)
        ? b.ingredients
            .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
            .map((v) => v.trim())
        : undefined,
    cookTime:
      mode === "Eat In" &&
      typeof b.cookTime === "string" &&
      (COOK_TIMES as readonly string[]).includes(b.cookTime)
        ? (b.cookTime as CookTime)
        : undefined,
    hours: mode !== "Eat In" ? parseWeeklyHours(b.hours) : undefined,
  };
}
