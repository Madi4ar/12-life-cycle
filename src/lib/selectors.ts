import { isToday } from "./dates";
import type { Cycle, Goal, Milestone, Project, Task } from "./types";

export function tasksForWeek(tasks: Task[], weekNumber: number): Task[] {
  return tasks.filter((t) => t.weekNumber === weekNumber);
}

export function tasksForToday(tasks: Task[]): Task[] {
  return tasks.filter((t) => {
    if (t.dueAt && isToday(t.dueAt)) return true;
    if (t.scheduledAt && isToday(t.scheduledAt)) return true;
    return false;
  });
}

export function big3Tasks(tasks: Task[]): Task[] {
  return tasksForToday(tasks).filter((t) => t.isBig3);
}

export function restTasks(tasks: Task[]): Task[] {
  return tasksForToday(tasks).filter((t) => !t.isBig3);
}

export function goalProgressPercent(goal: Goal): number {
  if (goal.targetValue <= 0) return 0;
  return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
}

export function projectForGoal(projects: Project[], goalId: string): Project[] {
  return projects.filter((p) => p.goalId === goalId);
}

export function milestonesForProject(milestones: Milestone[], projectId: string): Milestone[] {
  return milestones
    .filter((m) => m.projectId === projectId)
    .sort((a, b) => a.order - b.order);
}

export function nextMilestone(milestones: Milestone[], projectId: string): Milestone | null {
  const list = milestonesForProject(milestones, projectId);
  return list.find((m) => m.status !== "done") ?? null;
}

export function goalById(goals: Goal[], id: string | null): Goal | null {
  if (!id) return null;
  return goals.find((g) => g.id === id) ?? null;
}

export function lifeAreaTitle(areas: { id: string; title: string }[], id: string | null): string | null {
  if (!id) return null;
  return areas.find((a) => a.id === id)?.title ?? null;
}

export function cycleProgressPercent(cycle: Cycle, currentWeek: number): number {
  return Math.round((currentWeek / 12) * 100);
}
