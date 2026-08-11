import { NextRequest, NextResponse } from "next/server";
import { clearPlanDay, setPlanDay } from "@/lib/planStore";
import { MODES } from "@/lib/types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  if (!DATE_PATTERN.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const mode = b.mode;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (typeof mode !== "string" || !MODES.includes(mode as (typeof MODES)[number])) {
    return NextResponse.json({ error: "A valid mode is required" }, { status: 400 });
  }

  const plan = await setPlanDay(date, {
    date,
    name,
    mode: mode as (typeof MODES)[number],
    entryId: typeof b.entryId === "string" ? b.entryId : undefined,
  });
  return NextResponse.json(plan);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;
  if (!DATE_PATTERN.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const plan = await clearPlanDay(date);
  return NextResponse.json(plan);
}
