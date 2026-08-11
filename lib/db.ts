import { promises as fs } from "fs";
import path from "path";
import type { Entry, EntryInput } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "entries.json");
const SEED_FILE = path.join(DATA_DIR, "seed.json");

// Serializes reads/writes within this process so two quick mutations
// (e.g. rapid edit + delete) can't interleave and corrupt the file.
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    const seed = await fs.readFile(SEED_FILE, "utf-8").catch(() => "[]");
    await fs.writeFile(DATA_FILE, seed, "utf-8");
  }
}

async function readAll(): Promise<Entry[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    return JSON.parse(raw) as Entry[];
  } catch {
    return [];
  }
}

async function writeAll(entries: Entry[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export function listEntries(): Promise<Entry[]> {
  return enqueue(async () => {
    const entries = await readAll();
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  });
}

export function createEntry(input: EntryInput): Promise<Entry> {
  return enqueue(async () => {
    const entries = await readAll();
    const now = new Date().toISOString();
    const entry: Entry = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    entries.push(entry);
    await writeAll(entries);
    return entry;
  });
}

export function updateEntry(
  id: string,
  input: EntryInput,
): Promise<Entry | null> {
  return enqueue(async () => {
    const entries = await readAll();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) return null;
    const updated: Entry = {
      ...entries[index],
      ...input,
      id,
      updatedAt: new Date().toISOString(),
    };
    entries[index] = updated;
    await writeAll(entries);
    return updated;
  });
}

export function deleteEntry(id: string): Promise<boolean> {
  return enqueue(async () => {
    const entries = await readAll();
    const next = entries.filter((e) => e.id !== id);
    if (next.length === entries.length) return false;
    await writeAll(next);
    return true;
  });
}
