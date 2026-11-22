"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { goalById } from "@/lib/selectors";

function fmtClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FocusPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();
  const taskId = params.taskId;

  const task = useStore((s) => s.tasks.find((t) => t.id === taskId));
  const goals = useStore((s) => s.goals);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);
  const postponeTask = useStore((s) => s.postponeTask);
  const startFocusSession = useStore((s) => s.startFocusSession);
  const endFocusSession = useStore((s) => s.endFocusSession);

  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = startFocusSession(taskId);
    return () => {
      if (sessionIdRef.current) endFocusSession(sessionIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [paused]);

  if (!task) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <button onClick={() => router.push("/")} className="btn-ghost">
          Вернуться
        </button>
      </div>
    );
  }

  const goal = goalById(goals, task.goalId);

  function finish() {
    if (sessionIdRef.current) endFocusSession(sessionIdRef.current);
    sessionIdRef.current = null;
    if (task!.status !== "done") toggleTaskDone(task!.id);
    router.push("/");
  }

  function postpone() {
    if (sessionIdRef.current) endFocusSession(sessionIdRef.current);
    sessionIdRef.current = null;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    postponeTask(task!.id, tomorrow.toISOString());
    router.push("/");
  }

  function exit() {
    if (sessionIdRef.current) endFocusSession(sessionIdRef.current);
    sessionIdRef.current = null;
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 relative">
      <button
        onClick={exit}
        className="absolute top-6 right-6 text-[13px] text-text-secondary hover:text-text-primary"
      >
        Выйти
      </button>

      <div className="text-[13px] text-text-secondary mb-6">
        {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
      </div>

      <h1 className="text-[28px] font-semibold text-center max-w-[480px] mb-6">{task.title}</h1>

      {goal && (
        <div className="text-[14px] text-text-secondary mb-10">
          Цель: <span className="text-text-primary">{goal.title}</span>
        </div>
      )}

      <div className="text-[52px] font-light tabular-nums mb-12 text-text-primary">{fmtClock(elapsed)}</div>

      <div className="flex gap-3">
        <button onClick={() => setPaused((p) => !p)} className="btn-ghost min-w-[120px]">
          {paused ? "Продолжить" : "Пауза"}
        </button>
        <button onClick={finish} className="btn-primary min-w-[120px]">
          Завершить
        </button>
      </div>
      <button onClick={postpone} className="mt-5 text-[13px] text-text-secondary hover:text-text-primary">
        Перенести на завтра
      </button>
    </div>
  );
}
