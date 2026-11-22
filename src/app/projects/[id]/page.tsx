"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Checkbox, EmptyState, SectionLabel } from "@/components/ui";
import { milestonesForProject } from "@/lib/selectors";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  done: "Done",
};

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const goals = useStore((s) => s.goals);
  const milestones = useStore((s) => s.milestones);
  const tasks = useStore(useShallow((s) => s.tasks.filter((t) => t.projectId === projectId)));

  const addMilestone = useStore((s) => s.addMilestone);
  const cycleMilestoneStatus = useStore((s) => s.cycleMilestoneStatus);
  const removeMilestone = useStore((s) => s.removeMilestone);
  const addTask = useStore((s) => s.addTask);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);
  const updateProject = useStore((s) => s.updateProject);
  const removeProject = useStore((s) => s.removeProject);

  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!project) {
    return <EmptyState title="Проект не найден" />;
  }

  const projectMilestones = milestonesForProject(milestones, project.id);
  const goal = goals.find((g) => g.id === project.goalId);

  function submitMilestone() {
    if (!milestoneTitle.trim()) return;
    addMilestone(project!.id, milestoneTitle.trim());
    setMilestoneTitle("");
  }

  function submitTask() {
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      type: project!.goalId ? "strategic" : "operational",
      goalId: project!.goalId,
      projectId: project!.id,
    });
    setTaskTitle("");
  }

  function handleDelete() {
    removeProject(project!.id);
    router.push("/projects");
  }

  return (
    <div className="pt-6 pb-10">
      <Link href="/projects" className="text-[13px] text-text-secondary hover:text-text-primary">
        ← Projects
      </Link>
      <div className="flex items-start justify-between mt-3 mb-1">
        <h1 className="text-[24px] font-semibold">{project.title}</h1>
      </div>
      <div className="flex items-center gap-3 mb-6">
        {goal ? (
          <span className="text-[13px] text-text-secondary">🎯 {goal.title}</span>
        ) : (
          <span className="text-[13px] text-text-secondary">Без привязанной цели</span>
        )}
      </div>

      <SectionLabel>Milestones</SectionLabel>
      {projectMilestones.length === 0 ? (
        <EmptyState title="Пока нет milestones" />
      ) : (
        <div className="flex flex-col gap-1 mb-4">
          {projectMilestones.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3 px-1 py-2">
              <div className="text-[13px] text-text-secondary w-6">{i + 1}</div>
              <button
                onClick={() => cycleMilestoneStatus(m.id)}
                className={`text-[13px] px-2.5 py-1 rounded-full font-medium ${
                  m.status === "done"
                    ? "bg-accent-soft text-accent-dark"
                    : m.status === "active"
                    ? "bg-muted text-text-primary"
                    : "bg-muted text-text-secondary"
                }`}
              >
                {STATUS_LABEL[m.status]}
              </button>
              <div className={`flex-1 text-[14px] ${m.status === "done" ? "text-text-secondary line-through" : "text-text-primary"}`}>
                {m.title}
              </div>
              <button
                onClick={() => removeMilestone(m.id)}
                className="text-text-secondary text-[12px] hover:text-text-primary"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 mb-8">
        <input
          value={milestoneTitle}
          onChange={(e) => setMilestoneTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitMilestone()}
          placeholder="Добавить milestone…"
          className="input-plain flex-1"
        />
        <button onClick={submitMilestone} className="btn-ghost">
          Добавить
        </button>
      </div>

      <SectionLabel>Задачи проекта</SectionLabel>
      {tasks.length === 0 ? (
        <EmptyState title="Пока нет задач" />
      ) : (
        <div className="flex flex-col gap-1 mb-4">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-1 py-2">
              <Checkbox checked={t.status === "done"} onChange={() => toggleTaskDone(t.id)} />
              <div className={`flex-1 text-[14px] ${t.status === "done" ? "line-through text-text-secondary" : "text-text-primary"}`}>
                {t.title}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 mb-10">
        <input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitTask()}
          placeholder="Добавить задачу проекта…"
          className="input-plain flex-1"
        />
        <button onClick={submitTask} className="btn-ghost">
          Добавить
        </button>
      </div>

      <div className="flex items-center justify-between">
        <select
          value={project.status}
          onChange={(e) => updateProject(project.id, { status: e.target.value as typeof project.status })}
          className="input-plain text-[13px]"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
        {confirmingDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-text-secondary">Удалить проект?</span>
            <button onClick={handleDelete} className="text-[13px] text-accent-dark font-medium">
              Да, удалить
            </button>
            <button onClick={() => setConfirmingDelete(false)} className="text-[13px] text-text-secondary">
              Отмена
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="text-[13px] text-text-secondary hover:text-text-primary"
          >
            Удалить проект
          </button>
        )}
      </div>
    </div>
  );
}
