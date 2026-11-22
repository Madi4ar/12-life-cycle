import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Habit, HabitLog, Task } from "./types";

export function executionScore(tasks: Task[]): { planned: number; completed: number; score: number } {
  const strategic = tasks.filter((t) => t.type === "strategic");
  const planned = strategic.length;
  const completed = strategic.filter((t) => t.status === "done").length;
  const score = planned > 0 ? Math.round((completed / planned) * 100) : 0;
  return { planned, completed, score };
}

export function strategicFocusRatio(tasks: Task[]): number {
  const relevant = tasks.filter((t) => t.status === "done");
  if (relevant.length === 0) return 0;
  const strategicMinutes = relevant
    .filter((t) => t.type === "strategic")
    .reduce((sum, t) => sum + (t.estimatedMinutes ?? 30), 0);
  const totalMinutes = relevant.reduce((sum, t) => sum + (t.estimatedMinutes ?? 30), 0);
  if (totalMinutes === 0) return 0;
  return Math.round((strategicMinutes / totalMinutes) * 100);
}

export function habitConsistency(habit: Habit, logs: HabitLog[], daysBack = 28): number {
  const relevantLogs = logs.filter((l) => l.habitId === habit.id);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  const recent = relevantLogs.filter((l) => parseISO(l.date) >= cutoff);
  const weeks = daysBack / 7;
  const target = habit.targetPerWeek * weeks;
  if (target <= 0) return 0;
  return Math.min(100, Math.round((recent.length / target) * 100));
}

export function habitWeekCount(habit: Habit, logs: HabitLog[], weekDates: string[]): number {
  return logs.filter((l) => l.habitId === habit.id && weekDates.includes(l.date)).length;
}

export function totalFocusMinutes(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
}

export function daysSince(dateISO: string): number {
  return differenceInCalendarDays(new Date(), parseISO(dateISO));
}
