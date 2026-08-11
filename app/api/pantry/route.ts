import { NextRequest, NextResponse } from "next/server";
import { readPantry, writePantry } from "@/lib/pantryStore";

export async function GET() {
  const pantry = await readPantry();
  return NextResponse.json(pantry);
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const items = Array.isArray((body as Record<string, unknown>)?.items)
    ? (body as { items: unknown[] }).items
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        .map((v) => v.trim())
    : [];

  const saved = await writePantry({ items });
  return NextResponse.json(saved);
}
