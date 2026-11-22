"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Card, EmptyState, SectionLabel } from "@/components/ui";
import { habitConsistency, habitWeekCount } from "@/lib/metrics";
import { toISODate } from "@/lib/dates";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

function currentWeekDates(): Date[] {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function HabitsPage() {
  const habits = useStore(useShallow((s) => s.habits.filter((h) => !h.archived)));
  const habitLogs = useStore((s) => s.habitLogs);
  const addHabit = useStore((s) => s.addHabit);
  const removeHabit = useStore((s) => s.removeHabit);
  const toggleHabitLog = useStore((s) => s.toggleHabitLog);

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("3");

  const days = currentWeekDates();
  const dayISOs = days.map(toISODate);
  const today = toISODate(new Date());

  function submit() {
    if (!title.trim()) return;
    addHabit(title.trim(), Number(target) || 1);
    setTitle("");
  }

  return (
    <div className="pt-6 pb-10">
      <h1 className="text-[24px] font-semibold mb-5">Habits</h1>

      <Card className="p-4 mb-6">
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Новая привычка, например «Спорт 3× в неделю»"
            className="input-plain flex-1"
          />
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="раз/нед"
            className="input-plain w-[90px]"
          />
          <button onClick={submit} className="btn-primary">
            Добавить
          </button>
        </div>
      </Card>

      {habits.length === 0 ? (
        <EmptyState title="Пока нет привычек" />
      ) : (
        <div className="flex flex-col gap-3">
          <SectionLabel>Эта неделя</SectionLabel>
          <div className="flex pl-[180px] gap-1 mb-1">
            {days.map((d, i) => (
              <div key={i} className="w-9 text-center text-[11px] text-text-secondary">
                {format(d, "EEEEEE", { locale: ru })}
              </div>
            ))}
          </div>
          {habits.map((h) => {
            const weekCount = habitWeekCount(h, habitLogs, dayISOs);
            const consistency = habitConsistency(h, habitLogs);
            return (
              <Card key={h.id} className="p-3 flex items-center gap-3">
                <div className="w-[164px] shrink-0">
                  <div className="text-[14px] text-text-primary truncate">{h.title}</div>
                  <div className="text-[12px] text-text-secondary">
                    {weekCount}/{h.targetPerWeek} · Consistency {consistency}%
                  </div>
                </div>
                <div className="flex gap-1 flex-1">
                  {dayISOs.map((iso) => {
                    const done = habitLogs.some((l) => l.habitId === h.id && l.date === iso);
                    return (
                      <button
                        key={iso}
                        onClick={() => toggleHabitLog(h.id, iso)}
                        className={`w-9 h-9 rounded-[9px] border transition-colors ${
                          done
                            ? "bg-accent-dark border-accent-dark"
                            : iso === today
                            ? "border-accent bg-surface"
                            : "border-border bg-surface hover:bg-muted"
                        }`}
                      />
                    );
                  })}
                </div>
                <button
                  onClick={() => removeHabit(h.id)}
                  className="text-text-secondary hover:text-text-primary text-[12px] px-1"
                >
                  ×
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
