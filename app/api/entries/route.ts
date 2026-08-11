import { NextRequest, NextResponse } from "next/server";
import { createEntry, listEntries } from "@/lib/db";
import { parseEntryInput } from "@/lib/validate";

export async function GET() {
  const entries = await listEntries();
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = parseEntryInput(body);
    const entry = await createEntry(input);
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
