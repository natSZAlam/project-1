import { NextRequest, NextResponse } from "next/server";
import { deleteLogEntry } from "@/lib/logStore";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ok = await deleteLogEntry(id);
  if (!ok) {
    return NextResponse.json({ error: "Log entry not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
