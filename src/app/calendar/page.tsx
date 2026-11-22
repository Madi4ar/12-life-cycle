"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, EmptyState, Pill, SectionLabel } from "@/components/ui";
import { fmtDay, toISODate } from "@/lib/dates";
import type { EventType } from "@/lib/types";
import { addDays, parseISO } from "date-fns";

const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_HEIGHT = 56;

const TONE_BY_TYPE: Record<EventType, "strategic" | "meeting" | "personal" | "habit"> = {
  strategic: "strategic",
  meeting: "meeting",
  personal: "personal",
  habit: "habit",
};

export default function CalendarPage() {
  const events = useStore((s) => s.events);
  const tasks = useStore((s) => s.tasks);
  const addEvent = useStore((s) => s.addEvent);
  const removeEvent = useStore((s) => s.removeEvent);
  const updateTask = useStore((s) => s.updateTask);

  const [date, setDate] = useState(() => new Date());
  const dateISO = toISODate(date);

  const [schedulingTaskId, setSchedulingTaskId] = useState<string | null>(null);
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [type, setType] = useState<EventType>("personal");

  const dayEvents = useMemo(
    () => events.filter((e) => e.start.slice(0, 10) === dateISO).sort((a, b) => a.start.localeCompare(b.start)),
    [events, dateISO]
  );

  const unscheduled = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status === "open" &&
          !t.scheduledAt &&
          ((t.dueAt && t.dueAt.slice(0, 10) === dateISO) || (t.weekNumber !== null && !t.dueAt))
      ),
    [tasks, dateISO]
  );

  function minutesFromStart(iso: string) {
    const d = parseISO(iso);
    return (d.getHours() - START_HOUR) * 60 + d.getMinutes();
  }

  function addEventAt(hour: number) {
    setTime(`${String(hour).padStart(2, "0")}:00`);
    setFormOpen(true);
  }

  function submitEvent() {
    if (!title.trim()) return;
    const [h, m] = time.split(":").map(Number);
    const start = new Date(date);
    start.setHours(h ?? 9, m ?? 0, 0, 0);
    const end = new Date(start.getTime() + (Number(duration) || 60) * 60000);
    addEvent({ title: title.trim(), type, start: start.toISOString(), end: end.toISOString(), taskId: null });
    setTitle("");
    setFormOpen(false);
  }

  function submitSchedule(taskId: string) {
    const [h, m] = scheduleTime.split(":").map(Number);
    const start = new Date(date);
    start.setHours(h ?? 9, m ?? 0, 0, 0);
    const task = tasks.find((t) => t.id === taskId);
    const end = new Date(start.getTime() + (task?.estimatedMinutes ?? 60) * 60000);
    addEvent({
      title: task?.title ?? "Задача",
      type: task?.type === "strategic" ? "strategic" : "personal",
      start: start.toISOString(),
      end: end.toISOString(),
      taskId,
    });
    updateTask(taskId, { scheduledAt: start.toISOString() });
    setSchedulingTaskId(null);
  }

  return (
    <div className="pt-6 pb-10">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setDate((d) => addDays(d, -1))} className="text-text-secondary hover:text-text-primary px-2">
          ←
        </button>
        <div className="text-center">
          <h1 className="text-[18px] font-semibold capitalize">{fmtDay(date.toISOString())}</h1>
          <button onClick={() => setDate(new Date())} className="text-[12px] text-text-secondary hover:text-text-primary">
            Сегодня
          </button>
        </div>
        <button onClick={() => setDate((d) => addDays(d, 1))} className="text-text-secondary hover:text-text-primary px-2">
          →
        </button>
      </div>

      <div className="flex gap-6">
        <Card className="flex-1 p-0 overflow-hidden">
          <div className="relative" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
            {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => {
              const hour = START_HOUR + i;
              return (
                <div
                  key={hour}
                  className="absolute inset-x-0 border-t border-border group"
                  style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                >
                  <div className="text-[11px] text-text-secondary px-3 pt-1">{String(hour).padStart(2, "0")}:00</div>
                  <button
                    onClick={() => addEventAt(hour)}
                    className="hidden group-hover:block absolute right-2 top-1 text-[11px] text-text-secondary hover:text-text-primary"
                  >
                    + add
                  </button>
                </div>
              );
            })}

            {dayEvents.map((e) => {
              const top = Math.max(0, minutesFromStart(e.start));
              const height = Math.max(24, (new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000);
              return (
                <div
                  key={e.id}
                  className="absolute left-16 right-3 rounded-[10px] px-3 py-1.5 bg-surface border border-border group/event"
                  style={{ top: (top / 60) * HOUR_HEIGHT, height: (height / 60) * HOUR_HEIGHT }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-medium text-text-primary truncate">{e.title}</div>
                    <button
                      onClick={() => removeEvent(e.id)}
                      className="hidden group-hover/event:block text-text-secondary hover:text-text-primary text-[12px]"
                    >
                      ×
                    </button>
                  </div>
                  <Pill tone={TONE_BY_TYPE[e.type]}>{e.type}</Pill>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="w-[260px] shrink-0 hidden lg:block">
          <SectionLabel>Unscheduled</SectionLabel>
          {unscheduled.length === 0 ? (
            <EmptyState title="Все задачи на этот день запланированы" />
          ) : (
            <div className="flex flex-col gap-2">
              {unscheduled.map((t) => (
                <Card key={t.id} className="p-3">
                  <div className="text-[13px] text-text-primary mb-2">{t.title}</div>
                  {schedulingTaskId === t.id ? (
                    <div className="flex gap-1">
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="input-plain flex-1 text-[12px] px-2 py-1"
                      />
                      <button onClick={() => submitSchedule(t.id)} className="btn-primary text-[12px] px-2 py-1">
                        OK
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSchedulingTaskId(t.id)}
                      className="text-[12px] text-text-secondary hover:text-text-primary"
                    >
                      Запланировать →
                    </button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={() => setFormOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative w-full max-w-[400px] card p-4" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название события"
              className="input-plain w-full mb-2"
            />
            <div className="flex gap-2 mb-3">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-plain" />
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Мин"
                className="input-plain w-[70px]"
              />
              <select value={type} onChange={(e) => setType(e.target.value as EventType)} className="input-plain flex-1">
                <option value="strategic">Strategic</option>
                <option value="meeting">Meeting</option>
                <option value="personal">Personal</option>
                <option value="habit">Habit</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setFormOpen(false)} className="btn-ghost">
                Отмена
              </button>
              <button onClick={submitEvent} className="btn-primary">
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
