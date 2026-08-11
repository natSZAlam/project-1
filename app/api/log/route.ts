import { NextRequest, NextResponse } from "next/server";
import { addLogEntry, listLog } from "@/lib/logStore";
import { MODES } from "@/lib/types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  const entries = await listLog();
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const mode = b.mode;
  if (typeof mode !== "string" || !MODES.includes(mode as (typeof MODES)[number])) {
    return NextResponse.json({ error: "A valid mode is required" }, { status: 400 });
  }

  const date = typeof b.date === "string" && DATE_PATTERN.test(b.date) ? b.date : "";
  if (!date) {
    return NextResponse.json({ error: "A valid date is required" }, { status: 400 });
  }

  const amount =
    typeof b.amount === "number" && Number.isFinite(b.amount) && b.amount >= 0
      ? b.amount
      : undefined;

  const entry = await addLogEntry({
    name,
    mode: mode as (typeof MODES)[number],
    date,
    amount,
    entryId: typeof b.entryId === "string" ? b.entryId : undefined,
  });

  return NextResponse.json(entry, { status: 201 });
}
