"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, Checkbox, EmptyState, ProgressBar, SectionLabel } from "@/components/ui";
import { getCurrentWeekNumber, getWeekRange } from "@/lib/dates";
import { tasksForWeek, goalById } from "@/lib/selectors";
import { executionScore } from "@/lib/metrics";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function WeekPage() {
  const cycle = useStore((s) => s.cycle);
  const tasks = useStore((s) => s.tasks);
  const goals = useStore((s) => s.goals);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);
  const addTask = useStore((s) => s.addTask);

  const currentWeek = cycle ? getCurrentWeekNumber(cycle) : 1;
  const [week, setWeek] = useState(currentWeek);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"strategic" | "operational">("strategic");
  const [newGoalId, setNewGoalId] = useState("");

  const weekTasks = useMemo(() => tasksForWeek(tasks, week), [tasks, week]);
  const strategic = weekTasks.filter((t) => t.type === "strategic");
  const operational = weekTasks.filter((t) => t.type === "operational");
  const score = executionScore(weekTasks);
  const activeGoals = goals.filter((g) => g.status === "active");

  const range = cycle ? getWeekRange(cycle, week) : null;

  function submitTask() {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      type: newType,
      goalId: newType === "strategic" ? newGoalId || null : null,
      weekNumber: week,
    });
    setNewTitle("");
  }

  return (
    <div className="pt-6 pb-10">
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={() => setWeek((w) => Math.max(1, w - 1))}
          className="text-text-secondary hover:text-text-primary px-2 py-1"
          disabled={week <= 1}
        >
          ←
        </button>
        <h1 className="text-[22px] font-semibold">Week {week} of 12</h1>
        <button
          onClick={() => setWeek((w) => Math.min(12, w + 1))}
          className="text-text-secondary hover:text-text-primary px-2 py-1"
          disabled={week >= 12}
        >
          →
        </button>
      </div>
      {range && (
        <div className="text-[13px] text-text-secondary text-center mb-6">
          {format(range.start, "d MMM", { locale: ru })} — {format(range.end, "d MMM", { locale: ru })}
        </div>
      )}

      <Card className="p-5 mb-8">
        <div className="flex items-end justify-between mb-2">
          <div className="text-[13px] text-text-secondary">Execution Score</div>
          <div className="text-[13px] text-text-secondary">
            {score.completed} / {score.planned}
          </div>
        </div>
        <div className="text-[32px] font-semibold mb-3">{score.score}%</div>
        <ProgressBar value={score.score} />
        <div className="text-[12px] text-text-secondary mt-2">
          Учитываются только стратегические действия, связанные с 12-недельными целями.
        </div>
      </Card>

      <SectionLabel>Strategic</SectionLabel>
      {strategic.length === 0 ? (
        <EmptyState title="Нет стратегических задач на эту неделю" />
      ) : (
        <div className="flex flex-col gap-1 mb-7">
          {strategic.map((t) => {
            const goal = goalById(goals, t.goalId);
            return (
              <div key={t.id} className="flex items-center gap-3 px-1 py-2">
                <Checkbox checked={t.status === "done"} onChange={() => toggleTaskDone(t.id)} />
                <div className="flex-1">
                  <div className={`text-[14px] ${t.status === "done" ? "line-through text-text-secondary" : "text-text-primary"}`}>
                    {t.title}
                  </div>
                  {goal && <div className="text-[12px] text-text-secondary">🎯 {goal.title}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SectionLabel>Operational</SectionLabel>
      {operational.length === 0 ? (
        <EmptyState title="Нет бытовых задач на эту неделю" />
      ) : (
        <div className="flex flex-col gap-1 mb-7">
          {operational.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-1 py-2">
              <Checkbox checked={t.status === "done"} onChange={() => toggleTaskDone(t.id)} />
              <div className={`flex-1 text-[14px] ${t.status === "done" ? "line-through text-text-secondary" : "text-text-primary"}`}>
                {t.title}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="p-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setNewType("strategic")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium ${
              newType === "strategic" ? "bg-accent-soft text-accent-dark" : "bg-muted text-text-secondary"
            }`}
          >
            Strategic
          </button>
          <button
            onClick={() => setNewType("operational")}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium ${
              newType === "operational" ? "bg-muted text-text-primary" : "bg-muted text-text-secondary"
            }`}
          >
            Operational
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitTask()}
            placeholder="Добавить действие на эту неделю…"
            className="input-plain flex-1"
          />
          {newType === "strategic" && activeGoals.length > 0 && (
            <select value={newGoalId} onChange={(e) => setNewGoalId(e.target.value)} className="input-plain">
              <option value="">Цель</option>
              {activeGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          )}
          <button onClick={submitTask} className="btn-primary">
            Добавить
          </button>
        </div>
      </Card>
    </div>
  );
}
