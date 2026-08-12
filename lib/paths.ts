import path from "path";

/** Where mutable app data lives (entries, settings, pantry, plan, history,
 * uploaded photos). Defaults to a local ./data folder for development. In
 * production (e.g. Render), set DATA_DIR to a mounted persistent disk path
 * so writes survive restarts and redeploys — the container filesystem
 * everywhere else is wiped on each deploy. */
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

/** Uploaded photos live under the same persistent directory, so everything
 * that needs to survive a redeploy sits behind one disk mount. */
export const UPLOADS_DIR = path.join(/* turbopackIgnore: true */ DATA_DIR, "uploads");

/** The seed file ships with the code, not with runtime state — always read
 * it from the deployed source, never from DATA_DIR (which starts out empty
 * on a fresh disk in production). */
export const SEED_FILE = path.join(process.cwd(), "data", "seed.json");
