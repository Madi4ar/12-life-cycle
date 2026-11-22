"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { getCurrentWeekNumber } from "@/lib/dates";
import type { EventType, TaskType } from "@/lib/types";

type QuickType = "task" | "project" | "goal" | "habit" | "note" | "event";

const TYPES: { key: QuickType; label: string }[] = [
  { key: "task", label: "Task" },
  { key: "project", label: "Project" },
  { key: "goal", label: "Goal" },
  { key: "habit", label: "Habit" },
  { key: "note", label: "Note" },
  { key: "event", label: "Event" },
];

export function QuickAddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<QuickType>("task");
  const [title, setTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("operational");
  const [goalId, setGoalId] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("30");
  const [eventType, setEventType] = useState<EventType>("personal");
  const [eventTime, setEventTime] = useState("09:00");
  const [prevOpen, setPrevOpen] = useState(open);

  const goals = useStore(useShallow((s) => s.goals.filter((g) => g.status === "active")));
  const cycle = useStore((s) => s.cycle);
  const addTask = useStore((s) => s.addTask);
  const addProject = useStore((s) => s.addProject);
  const addGoal = useStore((s) => s.addGoal);
  const addHabit = useStore((s) => s.addHabit);
  const addInboxItem = useStore((s) => s.addInboxItem);
  const addEvent = useStore((s) => s.addEvent);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTitle("");
      setTaskType("operational");
      setGoalId("");
      setMinutes("30");
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function submit() {
    if (!title.trim()) return;
    const week = cycle ? getCurrentWeekNumber(cycle) : null;

    if (type === "task") {
      addTask({
        title: title.trim(),
        type: taskType,
        goalId: goalId || null,
        estimatedMinutes: Number(minutes) || null,
        dueAt: new Date().toISOString(),
        weekNumber: week,
      });
    } else if (type === "project") {
      addProject(title.trim(), goalId || null);
    } else if (type === "goal") {
      addGoal({
        lifeAreaId: null,
        title: title.trim(),
        metricLabel: "",
        targetValue: 100,
        deadlineWeek: week ?? 12,
      });
    } else if (type === "habit") {
      addHabit(title.trim(), 3);
    } else if (type === "note") {
      addInboxItem(title.trim());
    } else if (type === "event") {
      const [h, m] = eventTime.split(":").map(Number);
      const start = new Date();
      start.setHours(h ?? 9, m ?? 0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60000);
      addEvent({
        title: title.trim(),
        type: eventType,
        start: start.toISOString(),
        end: end.toISOString(),
        taskId: null,
      });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative w-full max-w-[480px] card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                type === t.key ? "bg-accent-dark text-white" : "bg-muted text-text-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholderFor(type)}
          className="input-plain w-full mb-3"
        />

        {type === "task" && (
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setTaskType("strategic")}
                className={`flex-1 px-3 py-2 rounded-[10px] text-[13px] ${
                  taskType === "strategic" ? "bg-accent-soft text-accent-dark font-medium" : "bg-muted text-text-secondary"
                }`}
              >
                Strategic
              </button>
              <button
                onClick={() => setTaskType("operational")}
                className={`flex-1 px-3 py-2 rounded-[10px] text-[13px] ${
                  taskType === "operational" ? "bg-muted text-text-primary font-medium" : "bg-muted text-text-secondary"
                }`}
              >
                Operational
              </button>
            </div>
            {taskType === "strategic" && goals.length > 0 && (
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="input-plain w-full"
              >
                <option value="">Без цели</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            )}
            <input
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Минут"
              className="input-plain w-full"
            />
          </div>
        )}

        {type === "project" && goals.length > 0 && (
          <select value={goalId} onChange={(e) => setGoalId(e.target.value)} className="input-plain w-full mb-3">
            <option value="">Без цели</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        )}

        {type === "event" && (
          <div className="flex gap-2 mb-3">
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="input-plain"
            />
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="input-plain flex-1"
            >
              <option value="strategic">Strategic</option>
              <option value="meeting">Meeting</option>
              <option value="personal">Personal</option>
              <option value="habit">Habit</option>
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-1">
          <button onClick={onClose} className="btn-ghost">
            Отмена
          </button>
          <button onClick={submit} className="btn-primary" disabled={!title.trim()}>
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}

function placeholderFor(type: QuickType): string {
  switch (type) {
    case "task":
      return "Название задачи";
    case "project":
      return "Название проекта";
    case "goal":
      return "Название цели";
    case "habit":
      return "Название привычки";
    case "note":
      return "Что у вас в голове?";
    case "event":
      return "Название события";
  }
}
