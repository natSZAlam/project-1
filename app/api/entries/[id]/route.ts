import { NextRequest, NextResponse } from "next/server";
import { deleteEntry, updateEntry } from "@/lib/db";
import { geocodeAll } from "@/lib/geocode";
import { parseEntryInput } from "@/lib/validate";
import type { EntryInput } from "@/lib/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
    };

    const entry = await updateEntry(id, input);
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ok = await deleteEntry(id);
  if (!ok) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
