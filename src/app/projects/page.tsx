"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, EmptyState, ProgressBar } from "@/components/ui";
import { goalById, milestonesForProject } from "@/lib/selectors";

export default function ProjectsPage() {
  const projects = useStore((s) => s.projects);
  const goals = useStore((s) => s.goals);
  const milestones = useStore((s) => s.milestones);
  const addProject = useStore((s) => s.addProject);

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [goalId, setGoalId] = useState("");

  const activeGoals = goals.filter((g) => g.status === "active");

  function submit() {
    if (!title.trim()) return;
    addProject(title.trim(), goalId || null);
    setTitle("");
    setGoalId("");
    setAdding(false);
  }

  function progressFor(projectId: string) {
    const list = milestonesForProject(milestones, projectId);
    if (list.length === 0) return 0;
    return Math.round((list.filter((m) => m.status === "done").length / list.length) * 100);
  }

  return (
    <div className="pt-6 pb-10">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[24px] font-semibold">Projects</h1>
        <button onClick={() => setAdding((v) => !v)} className="btn-ghost text-[13px]">
          {adding ? "Отмена" : "+ Проект"}
        </button>
      </div>

      {adding && (
        <Card className="p-4 mb-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название проекта"
            className="input-plain w-full mb-2"
          />
          {activeGoals.length > 0 && (
            <select value={goalId} onChange={(e) => setGoalId(e.target.value)} className="input-plain w-full mb-3">
              <option value="">Без цели</option>
              {activeGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          )}
          <button onClick={submit} className="btn-primary w-full">
            Создать
          </button>
        </Card>
      )}

      {projects.length === 0 ? (
        <EmptyState title="Пока нет проектов" hint="Проект — это то, как вы движетесь к цели" />
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p) => {
            const goal = goalById(goals, p.goalId);
            const progress = progressFor(p.id);
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="p-5 hover:border-text-secondary/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-[15px] font-medium">{p.title}</div>
                    <div className="text-[13px] text-text-secondary">{progress}%</div>
                  </div>
                  {goal && <div className="text-[13px] text-text-secondary mb-3">🎯 {goal.title}</div>}
                  <ProgressBar value={progress} />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
