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

export interface Entry {
  id: string;
  name: string;
  mode: Mode;
  category: string;
  /** Eat Out only */
  location?: string;
  /** Order In only */
  deliveryApp?: string;
  /** "Go-to order" (Eat Out / Order In) or "what you'd cook" (Eat In) */
  goTo?: string;
  vibes: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EntryInput = Omit<Entry, "id" | "createdAt" | "updatedAt">;
