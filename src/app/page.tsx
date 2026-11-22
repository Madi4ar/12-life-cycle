"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { big3Tasks, goalById, lifeAreaTitle, restTasks, tasksForToday } from "@/lib/selectors";
import { Card, Checkbox, EmptyState, Pill, SectionLabel } from "@/components/ui";
import { fmtDay, fmtTime, todayDateOnly } from "@/lib/dates";
import type { Task } from "@/lib/types";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

export default function TodayPage() {
  const tasks = useStore((s) => s.tasks);
  const goals = useStore((s) => s.goals);
  const lifeAreas = useStore((s) => s.lifeAreas);
  const events = useStore((s) => s.events);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);
  const toggleBig3 = useStore((s) => s.toggleBig3);
  const addTask = useStore((s) => s.addTask);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState("");

  const today = todayDateOnly();
  const big3 = useMemo(() => big3Tasks(tasks), [tasks]);
  const rest = useMemo(() => restTasks(tasks).filter((t) => t.status === "open"), [tasks]);
  const todaysEvents = useMemo(
    () => events.filter((e) => e.start.slice(0, 10) === today).sort((a, b) => a.start.localeCompare(b.start)),
    [events, today]
  );
  const candidateTasks = useMemo(
    () => tasksForToday(tasks).filter((t) => !t.isBig3 && t.status === "open"),
    [tasks]
  );

  const totalPlannedMinutes = useMemo(() => {
    const taskMinutes = tasksForToday(tasks)
      .filter((t) => t.status === "open")
      .reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
    const eventMinutes = todaysEvents.reduce(
      (sum, e) => sum + (new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000,
      0
    );
    return Math.round(taskMinutes + eventMinutes);
  }, [tasks, todaysEvents]);

  const freeMinutes = useMemo(() => {
    const now = new Date();
    const dayEnd = new Date();
    dayEnd.setHours(22, 0, 0, 0);
    const windowMinutes = Math.max(0, (dayEnd.getTime() - now.getTime()) / 60000);
    const eventMinutes = todaysEvents.reduce(
      (sum, e) => sum + (new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000,
      0
    );
    return Math.max(0, Math.round(windowMinutes - eventMinutes));
  }, [todaysEvents]);

  const overloaded = totalPlannedMinutes > freeMinutes + 20;

  function goalTag(task: Task) {
    const goal = goalById(goals, task.goalId);
    if (goal) return goal.title;
    const area = lifeAreaTitle(lifeAreas, null);
    return area;
  }

  function fmtMinutes(m: number) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (h === 0) return `${mm} мин`;
    if (mm === 0) return `${h} ч`;
    return `${h} ч ${mm} мин`;
  }

  return (
    <div className="pt-6 pb-10">
      <div className="text-[13px] text-text-secondary capitalize mb-1">{fmtDay(new Date().toISOString())}</div>
      <h1 className="text-[30px] font-semibold mb-6">{greeting()}</h1>

      <p className="text-[14px] text-text-secondary mb-6">
        Сегодня у вас {big3.length} главн{big3.length === 1 ? "ая задача" : "ые задачи"}
        {todaysEvents.length > 0 ? ` и ${todaysEvents.length} событи${todaysEvents.length === 1 ? "е" : "я"}` : ""}. Свободно
        около {fmtMinutes(freeMinutes)}.
      </p>

      {overloaded && (
        <Card className="p-4 mb-6 bg-accent-soft border-none">
          <div className="text-[14px] text-text-primary">
            На сегодня запланировано {fmtMinutes(totalPlannedMinutes)} задач, но свободно только {fmtMinutes(freeMinutes)}.
          </div>
          <div className="text-[13px] text-text-secondary mt-1">Перенести часть задач на завтра?</div>
        </Card>
      )}

      <SectionLabel>Big 3</SectionLabel>
      <div className="flex flex-col gap-2 mb-8">
        {big3.map((task, i) => (
          <Card key={task.id} className="p-4 flex items-start gap-4">
            <div className="text-[22px] font-light text-text-secondary/60 w-6 shrink-0 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-[15px] ${task.status === "done" ? "line-through text-text-secondary" : "text-text-primary"}`}
              >
                {task.title}
              </div>
              <div className="text-[13px] text-text-secondary mt-0.5 flex items-center gap-2">
                {task.type === "strategic" && goalTag(task) && <span>🎯 {goalTag(task)}</span>}
                {task.estimatedMinutes && <span>{fmtMinutes(task.estimatedMinutes)}</span>}
              </div>
            </div>
            <Checkbox checked={task.status === "done"} onChange={() => toggleTaskDone(task.id)} />
            <Link
              href={`/focus/${task.id}`}
              className="text-[12px] text-text-secondary hover:text-text-primary self-center"
            >
              Focus
            </Link>
          </Card>
        ))}
        {Array.from({ length: Math.max(0, 3 - big3.length) }).map((_, i) => (
          <button
            key={`empty-${i}`}
            onClick={() => setPickerOpen(true)}
            className="border border-dashed border-border rounded-[14px] p-4 text-left text-[14px] text-text-secondary hover:bg-muted/60"
          >
            + Выбрать главную задачу
          </button>
        ))}
      </div>

      <SectionLabel>Если останется время</SectionLabel>
      {rest.length === 0 ? (
        <EmptyState title="Нет дополнительных задач на сегодня" />
      ) : (
        <div className="flex flex-col gap-1 mb-8">
          {rest.map((task) => (
            <div key={task.id} className="flex items-center gap-3 px-1 py-2">
              <Checkbox checked={task.status === "done"} onChange={() => toggleTaskDone(task.id)} />
              <div className="flex-1 text-[14px] text-text-primary">{task.title}</div>
              {big3.length < 3 && (
                <button
                  onClick={() => toggleBig3(task.id)}
                  className="text-[12px] text-text-secondary hover:text-text-primary"
                >
                  В Big 3
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-8">
        <input
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && quickTitle.trim()) {
              addTask({ title: quickTitle.trim(), type: "operational", dueAt: new Date().toISOString() });
              setQuickTitle("");
            }
          }}
          placeholder="Быстро добавить задачу на сегодня…"
          className="input-plain flex-1"
        />
      </div>

      {todaysEvents.length > 0 && (
        <>
          <SectionLabel>Up next</SectionLabel>
          <div className="flex flex-col gap-1">
            {todaysEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-1 py-2 text-[14px]">
                <div className="w-14 shrink-0 text-text-secondary tabular-nums">{fmtTime(e.start)}</div>
                <div className="flex-1 text-text-primary">{e.title}</div>
                <Pill tone={e.type === "strategic" ? "strategic" : e.type === "meeting" ? "meeting" : "personal"}>
                  {e.type}
                </Pill>
              </div>
            ))}
          </div>
        </>
      )}

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={() => setPickerOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative w-full max-w-[440px] card p-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-[14px] font-medium mb-3">Выберите до 3 главных задач на сегодня</div>
            <div className="flex flex-col gap-1 max-h-[320px] overflow-auto">
              {candidateTasks.length === 0 && (
                <EmptyState title="Нет задач на сегодня" hint="Добавьте задачу через Inbox или Quick Add" />
              )}
              {candidateTasks.map((t) => (
                <button
                  key={t.id}
                  disabled={big3.length >= 3}
                  onClick={() => {
                    toggleBig3(t.id);
                    setPickerOpen(false);
                  }}
                  className="text-left px-3 py-2.5 rounded-[10px] hover:bg-muted text-[14px] disabled:opacity-40"
                >
                  {t.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
