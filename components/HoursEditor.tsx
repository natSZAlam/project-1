"use client";

import { useState } from "react";
import { Clock, X } from "lucide-react";
import { DAY_KEYS, DAY_LABELS, type DayHours, type DayKey, type WeeklyHours } from "@/lib/types";
import { emptyDayHours } from "@/lib/hours";

function allDaysEqual(hours: WeeklyHours): boolean {
  const values = DAY_KEYS.map((d) => hours[d]);
  if (values.some((v) => !v)) return false;
  const first = values[0]!;
  return values.every(
    (v) => v!.closed === first.closed && v!.open === first.open && v!.close === first.close,
  );
}

function fillAllDays(day: DayHours): WeeklyHours {
  const hours: WeeklyHours = {};
  for (const key of DAY_KEYS) hours[key] = { ...day };
  return hours;
}

export default function HoursEditor({
  value,
  onChange,
}: {
  value: WeeklyHours | undefined;
  onChange: (hours: WeeklyHours | undefined) => void;
}) {
  const [sameEveryDay, setSameEveryDay] = useState(() => !value || allDaysEqual(value));

  if (!value) {
    return (
      <button
        type="button"
        onClick={() => onChange(fillAllDays(emptyDayHours()))}
        style={{ borderStyle: "dashed" }}
        className="block-btn flex w-full items-center justify-center gap-2 rounded-2xl bg-muted py-3 text-sm font-extrabold text-muted-foreground"
      >
        <Clock size={16} aria-hidden="true" />
        Add hours
      </button>
    );
  }

  function updateDay(day: DayKey, patch: Partial<DayHours>) {
    if (!value) return;
    const current = value[day] ?? emptyDayHours();
    const updated = { ...current, ...patch };
    if (sameEveryDay) {
      onChange(fillAllDays(updated));
    } else {
      onChange({ ...value, [day]: updated });
    }
  }

  function toggleSameEveryDay() {
    const next = !sameEveryDay;
    setSameEveryDay(next);
    if (next && value) {
      onChange(fillAllDays(value.mon ?? emptyDayHours()));
    }
  }

  const rows: DayKey[] = sameEveryDay ? ["mon"] : DAY_KEYS;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleSameEveryDay}
          className="block-chip block-chip-interactive px-2.5 py-1 text-[11px] font-extrabold"
          style={{
            backgroundColor: sameEveryDay ? "var(--color-primary)" : "var(--color-card)",
            color: sameEveryDay ? "#FFFFFF" : "var(--color-foreground)",
          }}
        >
          Same every day
        </button>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="flex items-center gap-1 text-xs font-extrabold text-destructive"
        >
          <X size={12} aria-hidden="true" />
          Remove hours
        </button>
      </div>

      <div className="space-y-1.5">
        {rows.map((day) => {
          const dayHours = value[day] ?? emptyDayHours();
          return (
            <div
              key={day}
              className="flex items-center gap-2 rounded-2xl border-[3px] border-foreground bg-card px-2.5 py-2"
            >
              {!sameEveryDay && (
                <span className="w-8 shrink-0 text-xs font-extrabold text-foreground">
                  {DAY_LABELS[day]}
                </span>
              )}
              <button
                type="button"
                onClick={() => updateDay(day, { closed: !dayHours.closed })}
                className="block-chip shrink-0 px-2 py-1 text-[10px] font-extrabold"
                style={{
                  backgroundColor: dayHours.closed ? "var(--color-destructive)" : "var(--color-card)",
                  color: dayHours.closed ? "#FFFFFF" : "var(--color-foreground)",
                }}
              >
                Closed
              </button>
              {!dayHours.closed && (
                <>
                  <input
                    type="time"
                    value={dayHours.open}
                    onChange={(e) => updateDay(day, { open: e.target.value })}
                    aria-label={`${sameEveryDay ? "Every day" : DAY_LABELS[day]} opening time`}
                    className="min-w-0 flex-1 rounded-xl border-2 border-foreground bg-card px-1.5 py-1 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/25"
                  />
                  <span className="text-xs font-bold text-muted-foreground">–</span>
                  <input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) => updateDay(day, { close: e.target.value })}
                    aria-label={`${sameEveryDay ? "Every day" : DAY_LABELS[day]} closing time`}
                    className="min-w-0 flex-1 rounded-xl border-2 border-foreground bg-card px-1.5 py-1 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs font-bold text-muted-foreground">
        A close time earlier than or equal to open means it runs past midnight.
      </p>
    </div>
  );
}
