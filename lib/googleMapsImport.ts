import { reverseGeocode } from "./geocode";
import type { GeoPoint } from "./types";

export interface ImportedPlace {
  name?: string;
  address?: string;
  geo?: GeoPoint;
}

const SHORT_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"]);

function decodeMapsText(raw: string): string {
  return decodeURIComponent(raw.replace(/\+/g, " ")).trim();
}

async function resolveShortLink(url: string): Promise<string> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "TonightsMenu/1.0 (personal two-person meal-decision app)" },
  });
  return res.url || url;
}

/** Pulls a place name and/or coordinates out of a Google Maps URL. Short
 * links (maps.app.goo.gl, goo.gl) are resolved first since the useful bits
 * only appear in the final, expanded URL. Anything we can't find is left
 * undefined rather than guessed — the review form is where gaps get filled
 * in by hand. */
export async function importFromGoogleMapsUrl(rawUrl: string): Promise<ImportedPlace> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }

  if (SHORT_LINK_HOSTS.has(url.hostname)) {
    try {
      url = new URL(await resolveShortLink(url.toString()));
    } catch {
      throw new Error("Couldn't follow that link — check your connection and try again.");
    }
  }

  const result: ImportedPlace = {};

  const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/);
  const queryParam = url.searchParams.get("query") ?? url.searchParams.get("q");
  const queryIsCoords = queryParam ? /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(queryParam) : false;

  if (placeMatch) {
    result.name = decodeMapsText(placeMatch[1]);
  } else if (queryParam && !queryIsCoords) {
    result.name = decodeMapsText(queryParam);
  }

  const coordMatch = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    result.geo = { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
  } else if (queryIsCoords && queryParam) {
    const [lat, lng] = queryParam.split(",").map(Number);
    result.geo = { lat, lng };
  }

  if (!result.name && !result.geo) {
    throw new Error(
      "Couldn't find a place in that link — try copying it straight from the Maps share button.",
    );
  }

  if (result.geo) {
    result.address = (await reverseGeocode(result.geo)) ?? undefined;
  }

  return result;
}
