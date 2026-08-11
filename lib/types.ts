export type Mode = "Eat In" | "Eat Out" | "Order In";

export const MODES: Mode[] = ["Eat In", "Eat Out", "Order In"];

export const CUISINE_CATEGORIES = [
  "Polish",
  "Italian",
  "American",
  "Japanese",
  "Indian",
  "Thai",
  "Chinese",
  "Sweet Treat",
] as const;

export const EAT_IN_CATEGORIES = [
  "Meat",
  "Pasta",
  "Fish",
  "Veggies",
  "Breakfast",
] as const;

export type CuisineCategory = (typeof CUISINE_CATEGORIES)[number];
export type EatInCategory = (typeof EAT_IN_CATEGORIES)[number];
export type Category = CuisineCategory | EatInCategory;

/** All categories that exist anywhere, for the Catalog's "browse by category" tabs. */
export const ALL_CATEGORIES: Category[] = [
  ...EAT_IN_CATEGORIES,
  ...CUISINE_CATEGORIES,
];

export function categoriesForMode(mode: Mode): readonly string[] {
  return mode === "Eat In" ? EAT_IN_CATEGORIES : CUISINE_CATEGORIES;
}

export const DEFAULT_VIBE_TAGS = [
  "Date Night",
  "Quick & Easy",
  "Comfort Food",
  "Special Occasion",
  "Budget-Friendly",
  "Healthy",
] as const;

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface EntryLocation {
  address: string;
  /** null when geocoding failed or hasn't happened yet (e.g. no network at save time). */
  geo: GeoPoint | null;
}

export interface Entry {
  id: string;
  name: string;
  mode: Mode;
  category: string;
  /** Eat Out only — one or more branch addresses. */
  locations?: EntryLocation[];
  /** Order In only */
  deliveryApp?: string;
  /** "Go-to order" (Eat Out / Order In) or "what you'd cook" (Eat In) */
  goTo?: string;
  vibes: string[];
  notes?: string;
  /** Relative path under /public, e.g. "/uploads/xyz.jpg" */
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export type EntryInput = Omit<Entry, "id" | "createdAt" | "updatedAt">;

/** What the client actually sends: raw address strings, geocoded server-side. */
export type EntryDraft = Omit<EntryInput, "locations"> & {
  locations?: string[];
};

/** Seed values for a fresh (not-yet-saved) entry — e.g. from a Quick Add
 * import. Every field is optional; whatever's missing keeps the form's
 * normal default. */
export interface EntryPrefill {
  name?: string;
  mode?: Mode;
  category?: string;
  locations?: string[];
}

export interface ReferencePoint {
  address: string;
  geo: GeoPoint | null;
}

/** Shared "home" and "university" reference points used for distance display. */
export interface Settings {
  home?: ReferencePoint;
  university?: ReferencePoint;
}
