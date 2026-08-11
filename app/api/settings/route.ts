import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geocode";
import { readSettings, writeSettings } from "@/lib/settingsStore";
import type { ReferencePoint, Settings } from "@/lib/types";

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(settings);
}

async function resolvePoint(value: unknown): Promise<ReferencePoint | undefined> {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const address = value.trim();
  const geo = await geocodeAddress(address);
  return { address, geo };
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const b = (typeof body === "object" && body !== null ? body : {}) as Record<
    string,
    unknown
  >;

  const home = await resolvePoint(b.home);
  const university = await resolvePoint(b.university);
  const currency =
    typeof b.currency === "string" && b.currency.trim() ? b.currency.trim().slice(0, 6) : undefined;

  const settings: Settings = {};
  if (home) settings.home = home;
  if (university) settings.university = university;
  if (currency) settings.currency = currency;

  const saved = await writeSettings(settings);
  return NextResponse.json(saved);
}
