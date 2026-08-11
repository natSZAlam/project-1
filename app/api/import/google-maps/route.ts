import { NextRequest, NextResponse } from "next/server";
import { guessCategory } from "@/lib/categoryGuess";
import { importFromGoogleMapsUrl } from "@/lib/googleMapsImport";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const url = typeof (body as Record<string, unknown>)?.url === "string"
    ? ((body as Record<string, unknown>).url as string)
    : "";

  if (!url.trim()) {
    return NextResponse.json({ error: "Paste a Google Maps link first." }, { status: 400 });
  }

  try {
    const place = await importFromGoogleMapsUrl(url);
    return NextResponse.json({
      name: place.name ?? null,
      address: place.address ?? null,
      category: place.name ? guessCategory(place.name) : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't read that link.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
