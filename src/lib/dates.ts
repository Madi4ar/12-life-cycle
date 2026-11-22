import {
  addDays,
  differenceInCalendarDays,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";
import { ru } from "date-fns/locale";
import type { Cycle } from "./types";

export const CYCLE_WEEKS = 12;
export const CYCLE_DAYS = CYCLE_WEEKS * 7;

export function todayISO(): string {
  return new Date().toISOString();
}

export function todayDateOnly(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function fmtDay(dateISO: string): string {
  return format(parseISO(dateISO), "EEEE, d MMMM", { locale: ru });
}

export function fmtShort(dateISO: string): string {
  return format(parseISO(dateISO), "d MMM", { locale: ru });
}

export function fmtTime(dateISO: string): string {
  return format(parseISO(dateISO), "HH:mm");
}

export function isToday(dateISO: string): boolean {
  return isSameDay(parseISO(dateISO), new Date());
}

export function isPast(dateISO: string): boolean {
  return isBefore(parseISO(dateISO), startOfDay(new Date()));
}

export function createDefaultCycle(): Cycle {
  const start = startOfDay(new Date());
  const end = endOfDay(addDays(start, CYCLE_DAYS - 1));
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    status: "active",
    reviewCompleted: false,
  };
}

export function getCurrentWeekNumber(cycle: Cycle, at: Date = new Date()): number {
  const start = startOfDay(parseISO(cycle.startDate));
  const diff = differenceInCalendarDays(startOfDay(at), start);
  const week = Math.floor(diff / 7) + 1;
  return Math.min(Math.max(week, 1), CYCLE_WEEKS);
}

export function getWeekRange(cycle: Cycle, weekNumber: number): { start: Date; end: Date } {
  const cycleStart = startOfDay(parseISO(cycle.startDate));
  const start = addDays(cycleStart, (weekNumber - 1) * 7);
  const end = endOfDay(addDays(start, 6));
  return { start, end };
}

export function isDateInWeek(dateISO: string, cycle: Cycle, weekNumber: number): boolean {
  const { start, end } = getWeekRange(cycle, weekNumber);
  const d = parseISO(dateISO);
  return !isBefore(d, start) && !isAfter(d, end);
}

export function daysLeftInCycle(cycle: Cycle): number {
  const end = parseISO(cycle.endDate);
  const diff = differenceInCalendarDays(end, new Date());
  return Math.max(diff, 0);
}

export function weekDays(cycle: Cycle, weekNumber: number): Date[] {
  const { start } = getWeekRange(cycle, weekNumber);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}
