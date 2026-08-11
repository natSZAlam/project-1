import { promises as fs } from "fs";
import path from "path";
import type { LogEntry, LogEntryInput } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(DATA_DIR, "log.json");

let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

async function readRaw(): Promise<LogEntry[]> {
  try {
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    return JSON.parse(raw) as LogEntry[];
  } catch {
    return [];
  }
}

async function writeRaw(entries: LogEntry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LOG_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export function listLog(): Promise<LogEntry[]> {
  return enqueue(async () => {
    const entries = await readRaw();
    return entries.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  });
}

export function addLogEntry(input: LogEntryInput): Promise<LogEntry> {
  return enqueue(async () => {
    const entries = await readRaw();
    const entry: LogEntry = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    entries.push(entry);
    await writeRaw(entries);
    return entry;
  });
}

export function deleteLogEntry(id: string): Promise<boolean> {
  return enqueue(async () => {
    const entries = await readRaw();
    const next = entries.filter((e) => e.id !== id);
    if (next.length === entries.length) return false;
    await writeRaw(next);
    return true;
  });
}
