import { NextRequest, NextResponse } from "next/server";
import { createEntry, listEntries } from "@/lib/db";
import { geocodeAll } from "@/lib/geocode";
import { parseEntryInput } from "@/lib/validate";
import type { EntryInput } from "@/lib/types";

export async function GET() {
  const entries = await listEntries();
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const raw = parseEntryInput(body);
    const locations = raw.locationAddresses
      ? await geocodeAll(raw.locationAddresses)
      : undefined;

    const input: EntryInput = {
      name: raw.name,
      mode: raw.mode,
      category: raw.category,
      vibes: raw.vibes,
      goTo: raw.goTo,
      notes: raw.notes,
      deliveryApp: raw.deliveryApp,
      locations,
      photo: raw.photo,
      ingredients: raw.ingredients,
      cookTime: raw.cookTime,
      hours: raw.hours,
    };

    const entry = await createEntry(input);
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
