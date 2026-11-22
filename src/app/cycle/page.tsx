"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, ProgressBar, SectionLabel, EmptyState } from "@/components/ui";
import { getCurrentWeekNumber, daysLeftInCycle } from "@/lib/dates";
import { goalProgressPercent, milestonesForProject, projectForGoal } from "@/lib/selectors";
import type { Task } from "@/lib/types";

export default function CyclePage() {
  const cycle = useStore((s) => s.cycle);
  const goals = useStore((s) => s.goals);
  const projects = useStore((s) => s.projects);
  const milestones = useStore((s) => s.milestones);
  const tasks = useStore((s) => s.tasks);
  const lifeAreas = useStore((s) => s.lifeAreas);
  const addGoal = useStore((s) => s.addGoal);

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState("");
  const [target, setTarget] = useState("");
  const [areaId, setAreaId] = useState("");
  const [deadline, setDeadline] = useState("12");

  if (!cycle) return null;
  const week = getCurrentWeekNumber(cycle);
  const activeGoals = goals.filter((g) => g.status === "active");

  function nextStrategicTask(goalId: string): Task | null {
    const list = tasks.filter((t) => t.goalId === goalId && t.status === "open");
    return list.sort((a, b) => (a.weekNumber ?? 99) - (b.weekNumber ?? 99))[0] ?? null;
  }

  function nextMilestoneTitle(goalId: string): string | null {
    const goalProjects = projectForGoal(projects, goalId);
    for (const p of goalProjects) {
      const list = milestonesForProject(milestones, p.id);
      const pending = list.find((m) => m.status !== "done");
      if (pending) return pending.title;
    }
    return null;
  }

  function submitGoal() {
    if (!title.trim()) return;
    addGoal({
      lifeAreaId: areaId || null,
      title: title.trim(),
      metricLabel: metric.trim(),
      targetValue: Number(target) || 1,
      deadlineWeek: Math.min(12, Math.max(1, Number(deadline) || 12)),
    });
    setTitle("");
    setMetric("");
    setTarget("");
    setAdding(false);
  }

  return (
    <div className="pt-6 pb-10">
      <h1 className="text-[24px] font-semibold mb-1">12-недельный цикл</h1>
      <div className="text-[13px] text-text-secondary mb-5">
        {daysLeftInCycle(cycle)} дн. осталось до конца цикла
      </div>

      <Card className="p-5 mb-8">
        <div className="flex items-end justify-between mb-2">
          <div className="text-[15px] font-medium">Week {week} / 12</div>
          <div className="text-[13px] text-text-secondary">{Math.round((week / 12) * 100)}%</div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${i < week ? "bg-accent" : "bg-muted"}`}
            />
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Главные цели</SectionLabel>
        <button onClick={() => setAdding((v) => !v)} className="text-[13px] text-text-secondary hover:text-text-primary">
          {adding ? "Отмена" : "+ Цель"}
        </button>
      </div>

      {adding && (
        <Card className="p-4 mb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название цели"
            className="input-plain w-full mb-2"
          />
          <div className="flex gap-2 mb-2">
            <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="input-plain flex-1">
              <option value="">Сфера</option>
              {lifeAreas
                .filter((a) => !a.hidden)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
            </select>
            <input
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              placeholder="Метрика"
              className="input-plain flex-1"
            />
          </div>
          <div className="flex gap-2 mb-3">
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Целевое значение"
              className="input-plain flex-1"
            />
            <input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Неделя (1-12)"
              className="input-plain w-[120px]"
            />
          </div>
          <button onClick={submitGoal} className="btn-primary w-full">
            Добавить цель
          </button>
        </Card>
      )}

      {activeGoals.length === 0 && !adding && (
        <EmptyState title="Пока нет активных целей" hint="Добавьте 3–5 целей для этого цикла" />
      )}

      <div className="flex flex-col gap-3">
        {activeGoals.map((goal) => {
          const progress = goalProgressPercent(goal);
          const milestone = nextMilestoneTitle(goal.id);
          const action = nextStrategicTask(goal.id);
          return (
            <Card key={goal.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="text-[16px] font-medium">{goal.title}</div>
                <div className="text-[13px] text-text-secondary">Неделя {goal.deadlineWeek}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-[12px] text-text-secondary mb-0.5">Метрика</div>
                  <div className="text-[14px]">{goal.metricLabel || "—"}</div>
                </div>
                <div>
                  <div className="text-[12px] text-text-secondary mb-0.5">Прогресс</div>
                  <div className="text-[14px]">
                    {goal.currentValue} / {goal.targetValue}
                  </div>
                </div>
              </div>
              <ProgressBar value={progress} />
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <div className="text-[12px] text-text-secondary mb-0.5">Следующий milestone</div>
                  <div className="text-[13px] text-text-primary">{milestone ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[12px] text-text-secondary mb-0.5">Следующее действие</div>
                  <div className="text-[13px] text-text-primary">{action?.title ?? "—"}</div>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <Link href="/projects" className="text-[12px] text-text-secondary hover:text-text-primary">
                  Проекты →
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
