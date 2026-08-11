import type { EntryLocation, GeoPoint } from "./types";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy caps free use at ~1 request/second and requires
// a descriptive User-Agent. This app is low-volume (two people, occasional
// catalog edits), so a simple shared delay is enough — no need for a real
// job queue.
let lastRequestAt = 0;
async function throttle() {
  const wait = 1100 - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}

/** Resolves a free-text address to coordinates. Returns null on any failure
 * (no network, no match, rate-limited, etc.) rather than throwing — a
 * restaurant should still be saveable even if we can't place it on a map. */
export async function geocodeAddress(address: string): Promise<GeoPoint | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  await throttle();

  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TonightsMenu/1.0 (personal two-person meal-decision app)",
        "Accept-Language": "en",
      },
    });
    if (!res.ok) return null;
    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!results.length) return null;
    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

/** Geocodes each address in order (not in parallel, to respect the rate limit). */
export async function geocodeAll(addresses: string[]): Promise<EntryLocation[]> {
  const results: EntryLocation[] = [];
  for (const address of addresses) {
    results.push({ address, geo: await geocodeAddress(address) });
  }
  return results;
}

/** Coordinates -> a human-readable address, for when we already have a pin
 * (e.g. from a Google Maps link) but need something to show/edit as text. */
export async function reverseGeocode(geo: GeoPoint): Promise<string | null> {
  await throttle();

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${geo.lat}&lon=${geo.lng}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "TonightsMenu/1.0 (personal two-person meal-decision app)",
        "Accept-Language": "en",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return typeof data.display_name === "string" ? data.display_name : null;
  } catch {
    return null;
  }
}
