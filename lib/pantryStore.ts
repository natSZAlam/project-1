import { promises as fs } from "fs";
import path from "path";
import { DATA_DIR } from "./paths";
import type { PantryState } from "./types";

const PANTRY_FILE = path.join(/* turbopackIgnore: true */ DATA_DIR, "pantry.json");

let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

export function readPantry(): Promise<PantryState> {
  return enqueue(async () => {
    try {
      const raw = await fs.readFile(PANTRY_FILE, "utf-8");
      return JSON.parse(raw) as PantryState;
    } catch {
      return { items: [] };
    }
  });
}

export function writePantry(state: PantryState): Promise<PantryState> {
  return enqueue(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(PANTRY_FILE, JSON.stringify(state, null, 2), "utf-8");
    return state;
  });
}
