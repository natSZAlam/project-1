import { NextResponse } from "next/server";
import { readPlan } from "@/lib/planStore";

export async function GET() {
  const plan = await readPlan();
  return NextResponse.json(plan);
}
