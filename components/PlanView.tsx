"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { addDays, getMonday, formatWeekRange, formatDayLabel, toISODate } from "@/lib/dates";
import type { Entry, MealPlan, PlannedMeal } from "@/lib/types";
import ModeBadge from "@/components/ModeBadge";
import PlanPickerModal from "@/components/PlanPickerModal";

export default function PlanView({
  initialPlan,
  entries,
}: {
  initialPlan: MealPlan;
  entries: Entry[];
}) {
  const [plan, setPlan] = useState<MealPlan>(initialPlan);
  const [weekOffset, setWeekOffset] = useState(0);
  const [pickerDate, setPickerDate] = useState<string | null>(null);

  const today = new Date();
  const monday = addDays(getMonday(today), weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const todayIso = toISODate(today);

  async function assign(meal: PlannedMeal) {
    const res = await fetch(`/api/plan/${meal.date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: meal.name, mode: meal.mode, entryId: meal.entryId }),
    });
    if (res.ok) {
      setPlan(await res.json());
    }
    setPickerDate(null);
  }

  async function clear(date: string) {
    const res = await fetch(`/api/plan/${date}`, { method: "DELETE" });
    if (res.ok) {
      setPlan(await res.json());
    }
  }

  return (
    <div className="px-4 pt-6 pb-10 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w - 1)}
          aria-label="Previous week"
          className="block-btn rounded-full bg-card p-2 text-foreground"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-display text-lg font-bold text-foreground">
            {formatWeekRange(monday)}
          </p>
          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="text-xs font-extrabold text-primary underline"
            >
              Back to this week
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w + 1)}
          aria-label="Next week"
          className="block-btn rounded-full bg-card p-2 text-foreground"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {days.map((day) => {
          const iso = toISODate(day);
          const meal = plan[iso];
          const isToday = iso === todayIso;
          return (
            <div
              key={iso}
              className="block-panel p-3"
              style={isToday ? { borderColor: "var(--color-primary)" } : undefined}
            >
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                {formatDayLabel(day)}
                {isToday && (
                  <span className="ml-1.5 text-primary">· Today</span>
                )}
              </p>
              {meal ? (
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ModeBadge mode={meal.mode} />
                    <span className="font-display font-bold text-foreground">
                      {meal.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => clear(iso)}
                    aria-label={`Clear plan for ${formatDayLabel(day)}`}
                    className="block-btn rounded-full bg-card p-1.5 text-foreground"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerDate(iso)}
                  style={{ borderStyle: "dashed" }}
                  className="block-btn mt-1.5 w-full rounded-2xl bg-muted py-2 text-sm font-extrabold text-muted-foreground"
                >
                  + Plan something
                </button>
              )}
            </div>
          );
        })}
      </div>

      {pickerDate && (
        <PlanPickerModal
          date={pickerDate}
          entries={entries}
          onAssign={assign}
          onClose={() => setPickerDate(null)}
        />
      )}
    </div>
  );
}
