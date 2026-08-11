import { CUISINE_CATEGORIES, type CuisineCategory } from "./types";

// Best-effort only — there's no menu/cuisine data in a Maps link without a
// paid Places API lookup, so this just pattern-matches common words in the
// place name. Wrong guesses are expected; the review form is where the
// human fixes it.
const KEYWORDS: Partial<Record<CuisineCategory, string[]>> = {
  Italian: ["pizza", "pizzeria", "pasta", "trattoria", "ristorante", "osteria", "italian"],
  Japanese: ["sushi", "ramen", "izakaya", "japanese", "sashimi"],
  Indian: ["curry", "tandoori", "masala", "indian"],
  Thai: ["thai", "pad thai"],
  Chinese: ["chinese", "wok", "dim sum", "szechuan", "sichuan"],
  Polish: ["pierogi", "polish", "bar mleczny", "zapiecek"],
  American: ["burger", "grill", "diner", "bbq", "steakhouse", "smokehouse"],
  "Sweet Treat": ["bakery", "patisserie", "dessert", "ice cream", "gelato", "cukiernia", "cafe", "coffee"],
};

export function guessCategory(name: string): CuisineCategory | null {
  const lower = name.toLowerCase();
  for (const category of CUISINE_CATEGORIES) {
    const keywords = KEYWORDS[category];
    if (keywords?.some((k) => lower.includes(k))) return category;
  }
  return null;
}
