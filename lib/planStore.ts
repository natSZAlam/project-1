import { promises as fs } from "fs";
import path from "path";
import type { MealPlan, PlannedMeal } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PLAN_FILE = path.join(DATA_DIR, "plan.json");

let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

async function readRaw(): Promise<MealPlan> {
  try {
    const raw = await fs.readFile(PLAN_FILE, "utf-8");
    return JSON.parse(raw) as MealPlan;
  } catch {
    return {};
  }
}

async function writeRaw(plan: MealPlan): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PLAN_FILE, JSON.stringify(plan, null, 2), "utf-8");
}

export function readPlan(): Promise<MealPlan> {
  return enqueue(readRaw);
}

export function setPlanDay(date: string, meal: PlannedMeal): Promise<MealPlan> {
  return enqueue(async () => {
    const plan = await readRaw();
    plan[date] = meal;
    await writeRaw(plan);
    return plan;
  });
}

export function clearPlanDay(date: string): Promise<MealPlan> {
  return enqueue(async () => {
    const plan = await readRaw();
    delete plan[date];
    await writeRaw(plan);
    return plan;
  });
}
