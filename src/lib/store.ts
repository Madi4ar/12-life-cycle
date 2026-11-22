"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { uid } from "./id";
import { createDefaultCycle, getCurrentWeekNumber } from "./dates";
import { buildDefaultLifeAreas } from "./defaultLifeAreas";
import type {
  CalendarEvent,
  Cycle,
  EnergyLevel,
  FocusSession,
  Goal,
  Habit,
  HabitLog,
  InboxCategory,
  InboxItem,
  LifeArea,
  Milestone,
  MilestoneStatus,
  Project,
  Task,
  TaskType,
  WeeklyReview,
} from "./types";

interface AppState {
  onboarded: boolean;
  lifeAreas: LifeArea[];
  cycle: Cycle | null;
  goals: Goal[];
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  events: CalendarEvent[];
  reviews: WeeklyReview[];
  inboxItems: InboxItem[];
  focusSessions: FocusSession[];

  seedLifeAreas: () => void;
  completeOnboarding: (payload: {
    goals: { title: string; lifeAreaId: string | null; metricLabel: string; targetValue: number; deadlineWeek: number }[];
  }) => void;

  updateLifeArea: (id: string, patch: Partial<LifeArea>) => void;
  reorderLifeAreas: (orderedIds: string[]) => void;

  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "cycleId" | "currentValue" | "status">) => string;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  addProject: (title: string, goalId: string | null) => string;
  updateProject: (id: string, patch: Partial<Project>) => void;
  removeProject: (id: string) => void;

  addMilestone: (projectId: string, title: string) => string;
  updateMilestone: (id: string, patch: Partial<Milestone>) => void;
  cycleMilestoneStatus: (id: string) => void;
  removeMilestone: (id: string) => void;

  addTask: (task: Partial<Task> & { title: string }) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTaskDone: (id: string) => void;
  toggleBig3: (id: string) => void;
  postponeTask: (id: string, toISODate: string | null) => void;
  removeTask: (id: string) => void;

  addHabit: (title: string, targetPerWeek: number) => string;
  removeHabit: (id: string) => void;
  toggleHabitLog: (habitId: string, dateISO: string) => void;

  addEvent: (event: Omit<CalendarEvent, "id">) => string;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  removeEvent: (id: string) => void;

  addReview: (review: Omit<WeeklyReview, "id" | "createdAt">) => void;

  addInboxItem: (text: string) => string;
  categorizeInboxItem: (id: string, category: InboxCategory) => void;
  removeInboxItem: (id: string) => void;

  startFocusSession: (taskId: string) => string;
  endFocusSession: (id: string) => void;

  advanceCycleWeek: () => void;
  startNewCycle: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      lifeAreas: [],
      cycle: null,
      goals: [],
      projects: [],
      milestones: [],
      tasks: [],
      habits: [],
      habitLogs: [],
      events: [],
      reviews: [],
      inboxItems: [],
      focusSessions: [],

      seedLifeAreas: () => {
        if (get().lifeAreas.length === 0) {
          set({ lifeAreas: buildDefaultLifeAreas() });
        }
      },

      completeOnboarding: ({ goals }) => {
        const cycle = createDefaultCycle();
        set({
          cycle,
          onboarded: true,
          goals: goals.map((g) => ({
            id: uid(),
            cycleId: cycle.id,
            lifeAreaId: g.lifeAreaId,
            title: g.title,
            metricLabel: g.metricLabel,
            targetValue: g.targetValue,
            currentValue: 0,
            deadlineWeek: g.deadlineWeek,
            status: "active",
            createdAt: new Date().toISOString(),
          })),
        });
      },

      updateLifeArea: (id, patch) =>
        set((s) => ({
          lifeAreas: s.lifeAreas.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      reorderLifeAreas: (orderedIds) =>
        set((s) => ({
          lifeAreas: orderedIds
            .map((id, i) => {
              const area = s.lifeAreas.find((a) => a.id === id);
              return area ? { ...area, order: i } : null;
            })
            .filter((a): a is LifeArea => a !== null),
        })),

      addGoal: (goal) => {
        const id = uid();
        set((s) => ({
          goals: [
            ...s.goals,
            {
              ...goal,
              id,
              cycleId: s.cycle?.id ?? "",
              currentValue: 0,
              status: "active",
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },
      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGoal: (id) =>
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== id),
          projects: s.projects.map((p) => (p.goalId === id ? { ...p, goalId: null } : p)),
          tasks: s.tasks.map((t) => (t.goalId === id ? { ...t, goalId: null, type: "operational" } : t)),
        })),

      addProject: (title, goalId) => {
        const id = uid();
        set((s) => ({
          projects: [
            ...s.projects,
            { id, title, goalId, status: "active", createdAt: new Date().toISOString() },
          ],
        }));
        return id;
      },
      updateProject: (id, patch) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removeProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          milestones: s.milestones.filter((m) => m.projectId !== id),
          tasks: s.tasks.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
        })),

      addMilestone: (projectId, title) => {
        const id = uid();
        set((s) => ({
          milestones: [
            ...s.milestones,
            {
              id,
              projectId,
              title,
              status: "pending",
              order: s.milestones.filter((m) => m.projectId === projectId).length,
            },
          ],
        }));
        return id;
      },
      updateMilestone: (id, patch) =>
        set((s) => ({ milestones: s.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      cycleMilestoneStatus: (id) => {
        const order: MilestoneStatus[] = ["pending", "active", "done"];
        set((s) => ({
          milestones: s.milestones.map((m) => {
            if (m.id !== id) return m;
            const next = order[(order.indexOf(m.status) + 1) % order.length];
            return { ...m, status: next };
          }),
        }));
      },
      removeMilestone: (id) =>
        set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) })),

      addTask: (task) => {
        const id = uid();
        const cycle = get().cycle;
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id,
              title: task.title,
              type: (task.type ?? "operational") as TaskType,
              goalId: task.goalId ?? null,
              projectId: task.projectId ?? null,
              status: task.status ?? "open",
              isBig3: task.isBig3 ?? false,
              energy: (task.energy ?? null) as EnergyLevel | null,
              estimatedMinutes: task.estimatedMinutes ?? null,
              scheduledAt: task.scheduledAt ?? null,
              dueAt: task.dueAt ?? null,
              weekNumber: task.weekNumber ?? (cycle ? getCurrentWeekNumber(cycle) : null),
              postponedCount: task.postponedCount ?? 0,
              completedAt: task.completedAt ?? null,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      toggleTaskDone: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === "done" ? "open" : "done",
                  completedAt: t.status === "done" ? null : new Date().toISOString(),
                }
              : t
          ),
        })),
      toggleBig3: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, isBig3: !t.isBig3 } : t)),
        })),
      postponeTask: (id, toISODate) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, dueAt: toISODate, postponedCount: t.postponedCount + 1 }
              : t
          ),
        })),
      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      addHabit: (title, targetPerWeek) => {
        const id = uid();
        set((s) => ({
          habits: [
            ...s.habits,
            { id, title, targetPerWeek, createdAt: new Date().toISOString(), archived: false },
          ],
        }));
        return id;
      },
      removeHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          habitLogs: s.habitLogs.filter((l) => l.habitId !== id),
        })),
      toggleHabitLog: (habitId, dateISO) =>
        set((s) => {
          const existing = s.habitLogs.find((l) => l.habitId === habitId && l.date === dateISO);
          if (existing) {
            return { habitLogs: s.habitLogs.filter((l) => l.id !== existing.id) };
          }
          return { habitLogs: [...s.habitLogs, { id: uid(), habitId, date: dateISO }] };
        }),

      addEvent: (event) => {
        const id = uid();
        set((s) => ({ events: [...s.events, { ...event, id }] }));
        return id;
      },
      updateEvent: (id, patch) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      addReview: (review) =>
        set((s) => ({
          reviews: [...s.reviews, { ...review, id: uid(), createdAt: new Date().toISOString() }],
        })),

      addInboxItem: (text) => {
        const id = uid();
        set((s) => ({
          inboxItems: [
            { id, text, category: null, processed: false, createdAt: new Date().toISOString() },
            ...s.inboxItems,
          ],
        }));
        return id;
      },
      categorizeInboxItem: (id, category) =>
        set((s) => ({
          inboxItems: s.inboxItems.map((i) => (i.id === id ? { ...i, category, processed: true } : i)),
        })),
      removeInboxItem: (id) => set((s) => ({ inboxItems: s.inboxItems.filter((i) => i.id !== id) })),

      startFocusSession: (taskId) => {
        const id = uid();
        set((s) => ({
          focusSessions: [
            ...s.focusSessions,
            { id, taskId, start: new Date().toISOString(), end: null, durationMinutes: 0 },
          ],
        }));
        return id;
      },
      endFocusSession: (id) =>
        set((s) => ({
          focusSessions: s.focusSessions.map((f) => {
            if (f.id !== id || f.end) return f;
            const start = new Date(f.start).getTime();
            const end = Date.now();
            return { ...f, end: new Date(end).toISOString(), durationMinutes: Math.round((end - start) / 60000) };
          }),
        })),

      advanceCycleWeek: () => {
        // week number is derived from dates, nothing to persist here besides a no-op hook
        set((s) => ({ ...s }));
      },

      startNewCycle: () => {
        const cycle = createDefaultCycle();
        set({
          cycle,
          goals: [],
          projects: [],
          milestones: [],
          tasks: get().tasks.filter((t) => t.type !== "strategic"),
          reviews: [],
        });
      },
    }),
    {
      name: "lifeos-storage",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
