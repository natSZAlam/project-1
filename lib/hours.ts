import { DAY_KEYS, type WeeklyHours } from "./types";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** true/false = known open state right now. null = no hours entered, so the
 * caller should treat it as "unknown" rather than closed. */
export function isOpenNow(hours: WeeklyHours | undefined, now: Date = new Date()): boolean | null {
  if (!hours || Object.keys(hours).length === 0) return null;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  // getDay(): 0=Sun..6=Sat: convert to our Mon-first DAY_KEYS index.
  const todayIndex = (now.getDay() + 6) % 7;
  const todayKey = DAY_KEYS[todayIndex];
  const yesterdayKey = DAY_KEYS[(todayIndex + 6) % 7];

  const today = hours[todayKey];
  if (today && !today.closed) {
    const openM = toMinutes(today.open);
    const closeM = toMinutes(today.close);
    if (closeM > openM) {
      if (nowMinutes >= openM && nowMinutes < closeM) return true;
    } else if (nowMinutes >= openM) {
      // crosses midnight — open from today's open time through the end of the day
      return true;
    }
  }

  const yesterday = hours[yesterdayKey];
  if (yesterday && !yesterday.closed) {
    const openM = toMinutes(yesterday.open);
    const closeM = toMinutes(yesterday.close);
    if (closeM <= openM && nowMinutes < closeM) {
      // still inside yesterday's overnight window
      return true;
    }
  }

  return false;
}

export function emptyDayHours(): { closed: boolean; open: string; close: string } {
  return { closed: false, open: "11:00", close: "22:00" };
}
