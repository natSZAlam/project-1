import { promises as fs } from "fs";
import path from "path";
import type { Settings } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

export function readSettings(): Promise<Settings> {
  return enqueue(async () => {
    try {
      const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
      return JSON.parse(raw) as Settings;
    } catch {
      return {};
    }
  });
}

export function writeSettings(settings: Settings): Promise<Settings> {
  return enqueue(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
    return settings;
  });
}
