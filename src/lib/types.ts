export type ID = string;

export type LifeAreaKey =
  | "work"
  | "finance"
  | "health"
  | "family"
  | "education"
  | "projects"
  | "social"
  | "rest"
  | "home";

export interface LifeArea {
  id: ID;
  key: LifeAreaKey | string;
  title: string;
  hidden: boolean;
  order: number;
  vision?: string;
}

export interface Cycle {
  id: ID;
  startDate: string; // ISO date
  endDate: string; // ISO date
  status: "active" | "completed";
  reviewCompleted: boolean;
}

export type GoalStatus = "active" | "completed" | "dropped";

export interface Goal {
  id: ID;
  cycleId: ID;
  lifeAreaId: ID | null;
  title: string;
  metricLabel: string; // e.g. "активных пользователей"
  targetValue: number;
  currentValue: number;
  deadlineWeek: number; // 1-12
  status: GoalStatus;
  createdAt: string;
}

export type ProjectStatus = "active" | "completed" | "paused";

export interface Project {
  id: ID;
  goalId: ID | null;
  title: string;
  status: ProjectStatus;
  createdAt: string;
}

export type MilestoneStatus = "pending" | "active" | "done";

export interface Milestone {
  id: ID;
  projectId: ID;
  title: string;
  status: MilestoneStatus;
  order: number;
}

export type TaskType = "strategic" | "operational";
export type TaskStatus = "open" | "done";
export type EnergyLevel = "high" | "medium" | "low";

export interface Task {
  id: ID;
  title: string;
  type: TaskType;
  goalId: ID | null;
  projectId: ID | null;
  status: TaskStatus;
  isBig3: boolean;
  energy: EnergyLevel | null;
  estimatedMinutes: number | null;
  scheduledAt: string | null; // ISO datetime
  dueAt: string | null; // ISO date
  weekNumber: number | null;
  postponedCount: number;
  completedAt: string | null;
  createdAt: string;
}

export interface Habit {
  id: ID;
  title: string;
  targetPerWeek: number;
  createdAt: string;
  archived: boolean;
}

export interface HabitLog {
  id: ID;
  habitId: ID;
  date: string; // ISO date
}

export type EventType = "strategic" | "meeting" | "personal" | "habit";

export interface CalendarEvent {
  id: ID;
  title: string;
  type: EventType;
  start: string; // ISO datetime
  end: string; // ISO datetime
  taskId: ID | null;
}

export interface WeeklyReview {
  id: ID;
  cycleId: ID;
  weekNumber: number;
  executionScore: number;
  focusMinutes: number;
  tasksPlanned: number;
  tasksCompleted: number;
  wins: string;
  blockers: string;
  changesNextWeek: string;
  createdAt: string;
}

export type InboxCategory =
  | "task"
  | "project"
  | "idea"
  | "note"
  | "goal"
  | "someday";

export interface InboxItem {
  id: ID;
  text: string;
  category: InboxCategory | null;
  processed: boolean;
  createdAt: string;
}

export interface FocusSession {
  id: ID;
  taskId: ID;
  start: string;
  end: string | null;
  durationMinutes: number;
}
