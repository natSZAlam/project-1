import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { UPLOADS_DIR } from "@/lib/paths";

// Matches exactly what /api/upload writes: a random UUID plus a known
// extension. Strict on purpose — this is also what stands between a
// filename param and a path-traversal attempt.
const FILENAME_PATTERN = /^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|gif)$/;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!FILENAME_PATTERN.test(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = filename.split(".").pop()!;
  try {
    const data = await fs.readFile(path.join(/* turbopackIgnore: true */ UPLOADS_DIR, filename));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext],
        // Filenames are random UUIDs, never reused — safe to cache forever.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
