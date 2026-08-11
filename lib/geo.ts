import type { EntryLocation, GeoPoint, Settings } from "./types";

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Straight-line ("as the crow flies") distance in km — we don't have a
 * routing API, so this is an estimate, not a driving distance. */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatKm(km: number): string {
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

export interface LocationWithDistance extends EntryLocation {
  distanceToHome: number | null;
  distanceToUniversity: number | null;
}

export function withDistances(
  locations: EntryLocation[],
  settings: Settings,
): LocationWithDistance[] {
  return locations.map((loc) => ({
    ...loc,
    distanceToHome:
      loc.geo && settings.home?.geo ? haversineKm(loc.geo, settings.home.geo) : null,
    distanceToUniversity:
      loc.geo && settings.university?.geo
        ? haversineKm(loc.geo, settings.university.geo)
        : null,
  }));
}

export function nearestBy(
  locations: LocationWithDistance[],
  key: "distanceToHome" | "distanceToUniversity",
): LocationWithDistance | null {
  let nearest: LocationWithDistance | null = null;
  for (const loc of locations) {
    const value = loc[key];
    if (value === null) continue;
    if (nearest === null || value < (nearest[key] as number)) nearest = loc;
  }
  return nearest;
}
