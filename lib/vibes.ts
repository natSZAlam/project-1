import { DEFAULT_VIBE_TAGS, type Entry } from "./types";

/** Default tags first (in their canonical order), then any custom tags used in the catalog. */
export function collectVibeTags(entries: Entry[]): string[] {
  const used = new Set<string>();
  for (const entry of entries) {
    for (const vibe of entry.vibes) used.add(vibe);
  }
  const extras = [...used]
    .filter((v) => !(DEFAULT_VIBE_TAGS as readonly string[]).includes(v))
    .sort((a, b) => a.localeCompare(b));
  return [...DEFAULT_VIBE_TAGS, ...extras];
}
