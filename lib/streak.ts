import { addDays, toISODate } from "./dates";

/** Consecutive days (ending today or, if today has no entry yet, ending
 * yesterday so the streak isn't shown as broken before the day is over)
 * with at least one log entry. */
export function computeStreak(dates: string[]): number {
  const uniqueDates = new Set(dates);
  const today = new Date();
  let cursor = uniqueDates.has(toISODate(today)) ? today : addDays(today, -1);

  let streak = 0;
  while (uniqueDates.has(toISODate(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
