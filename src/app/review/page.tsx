"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { BigStat, Card, EmptyState, SectionLabel } from "@/components/ui";
import { getCurrentWeekNumber } from "@/lib/dates";
import { tasksForWeek, goalProgressPercent } from "@/lib/selectors";
import { executionScore, habitConsistency, totalFocusMinutes } from "@/lib/metrics";

type Tab = "week" | "cycle";

function fmtMinutes(m: number) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm}м`;
  return `${h}ч ${mm}м`;
}

export default function ReviewPage() {
  const [tab, setTab] = useState<Tab>("week");
  const cycle = useStore((s) => s.cycle);
  const tasks = useStore((s) => s.tasks);
  const habits = useStore((s) => s.habits);
  const habitLogs = useStore((s) => s.habitLogs);
  const reviews = useStore((s) => s.reviews);
  const goals = useStore((s) => s.goals);
  const addReview = useStore((s) => s.addReview);

  const currentWeek = cycle ? getCurrentWeekNumber(cycle) : 1;
  const existingReview = reviews.find((r) => r.weekNumber === currentWeek);

  const weekTasks = useMemo(() => tasksForWeek(tasks, currentWeek), [tasks, currentWeek]);
  const score = executionScore(weekTasks);
  const focusMinutes = totalFocusMinutes(weekTasks);
  const doneCount = weekTasks.filter((t) => t.status === "done").length;
  const avgHabitConsistency = habits.length
    ? Math.round(habits.reduce((sum, h) => sum + habitConsistency(h, habitLogs), 0) / habits.length)
    : 0;

  const [wins, setWins] = useState("");
  const [blockers, setBlockers] = useState("");
  const [changes, setChanges] = useState("");

  function submitReview() {
    if (!cycle) return;
    addReview({
      cycleId: cycle.id,
      weekNumber: currentWeek,
      executionScore: score.score,
      focusMinutes,
      tasksPlanned: weekTasks.length,
      tasksCompleted: doneCount,
      wins,
      blockers,
      changesNextWeek: changes,
    });
    setWins("");
    setBlockers("");
    setChanges("");
  }

  const bestWeek = reviews.length
    ? reviews.reduce((a, b) => (b.executionScore > a.executionScore ? b : a))
    : null;
  const toughestReview = reviews.length
    ? reviews.reduce((a, b) => (b.executionScore < a.executionScore ? b : a))
    : null;
  const avgCycleScore = reviews.length
    ? Math.round(reviews.reduce((sum, r) => sum + r.executionScore, 0) / reviews.length)
    : 0;
  const bestHabit = habits.length
    ? habits.reduce((a, b) => (habitConsistency(b, habitLogs) > habitConsistency(a, habitLogs) ? b : a))
    : null;

  return (
    <div className="pt-6 pb-10">
      <h1 className="text-[24px] font-semibold mb-5">Review</h1>

      <div className="flex gap-1 mb-6">
        <button
          onClick={() => setTab("week")}
          className={`px-3 py-1.5 rounded-full text-[13px] font-medium ${
            tab === "week" ? "bg-accent-dark text-white" : "bg-muted text-text-secondary"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setTab("cycle")}
          className={`px-3 py-1.5 rounded-full text-[13px] font-medium ${
            tab === "cycle" ? "bg-accent-dark text-white" : "bg-muted text-text-secondary"
          }`}
        >
          12 Week Review
        </button>
      </div>

      {tab === "week" && (
        <>
          <Card className="p-6 mb-6">
            <div className="text-[13px] text-text-secondary mb-4">Your Week {currentWeek}</div>
            <div className="grid grid-cols-2 gap-5 mb-5">
              <BigStat label="Execution Score" value={`${score.score}%`} />
              <BigStat label="Focus" value={fmtMinutes(focusMinutes)} />
              <BigStat label="Задачи" value={`${doneCount} / ${weekTasks.length}`} />
              <BigStat label="Привычки" value={`${avgHabitConsistency}%`} />
            </div>
            {existingReview && (
              <div className="grid grid-cols-2 gap-5 pt-4 border-t border-border">
                <div>
                  <div className="text-[12px] text-text-secondary mb-1">Best result</div>
                  <div className="text-[14px]">{existingReview.wins || "—"}</div>
                </div>
                <div>
                  <div className="text-[12px] text-text-secondary mb-1">Main blocker</div>
                  <div className="text-[14px]">{existingReview.blockers || "—"}</div>
                </div>
              </div>
            )}
          </Card>

          {!existingReview ? (
            <Card className="p-6">
              <SectionLabel>Что получилось?</SectionLabel>
              <textarea
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                rows={2}
                className="input-plain w-full mb-4 resize-none"
                placeholder="Например: запущена первая версия продукта"
              />
              <SectionLabel>Что не получилось и почему?</SectionLabel>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                rows={2}
                className="input-plain w-full mb-4 resize-none"
                placeholder="Например: слишком много встреч"
              />
              <SectionLabel>Что изменить на следующей неделе?</SectionLabel>
              <textarea
                value={changes}
                onChange={(e) => setChanges(e.target.value)}
                rows={2}
                className="input-plain w-full mb-5 resize-none"
              />
              <button onClick={submitReview} className="btn-primary w-full">
                Завершить Weekly Review
              </button>
            </Card>
          ) : (
            <div className="text-[13px] text-text-secondary">Weekly Review на эту неделю завершён.</div>
          )}
        </>
      )}

      {tab === "cycle" && (
        <>
          {goals.length === 0 ? (
            <EmptyState title="Нет данных по целям" />
          ) : (
            <Card className="p-6 mb-6">
              <SectionLabel>Цели цикла</SectionLabel>
              <div className="flex flex-col gap-2">
                {goals.map((g) => (
                  <div key={g.id} className="flex items-center justify-between">
                    <span className="text-[14px] text-text-primary">{g.title}</span>
                    <span className="text-[14px] text-text-secondary">{goalProgressPercent(g)}%</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-border my-4" />
              <BigStat label="Execution Score" value={`${avgCycleScore}%`} />
            </Card>
          )}

          <Card className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="text-[12px] text-text-secondary mb-1">Самая продуктивная неделя</div>
                <div className="text-[14px]">
                  {bestWeek ? `Week ${bestWeek.weekNumber} — ${bestWeek.executionScore}%` : "—"}
                </div>
              </div>
              <div>
                <div className="text-[12px] text-text-secondary mb-1">Главные причины срыва</div>
                <div className="text-[14px]">{toughestReview?.blockers || "—"}</div>
              </div>
              <div>
                <div className="text-[12px] text-text-secondary mb-1">Лучшие привычки</div>
                <div className="text-[14px]">{bestHabit ? bestHabit.title : "—"}</div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
