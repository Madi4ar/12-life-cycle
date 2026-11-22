"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui";

type Step = "intro" | "areas" | "vision" | "goals" | "finish";

interface DraftGoal {
  title: string;
  lifeAreaId: string | null;
  metricLabel: string;
  targetValue: string;
  deadlineWeek: string;
}

function emptyGoal(): DraftGoal {
  return { title: "", lifeAreaId: null, metricLabel: "", targetValue: "", deadlineWeek: "12" };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");

  const lifeAreas = useStore((s) => s.lifeAreas);
  const updateLifeArea = useStore((s) => s.updateLifeArea);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [goals, setGoals] = useState<DraftGoal[]>([emptyGoal(), emptyGoal(), emptyGoal()]);

  const visibleAreas = lifeAreas.filter((a) => !a.hidden);

  function toggleArea(id: string, hidden: boolean) {
    updateLifeArea(id, { hidden });
  }

  function setVision(id: string, vision: string) {
    updateLifeArea(id, { vision });
  }

  function updateGoal(index: number, patch: Partial<DraftGoal>) {
    setGoals((g) => g.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addGoalRow() {
    setGoals((g) => [...g, emptyGoal()]);
  }

  function removeGoalRow(index: number) {
    setGoals((g) => g.filter((_, i) => i !== index));
  }

  function finish() {
    const validGoals = goals
      .filter((g) => g.title.trim())
      .map((g) => ({
        title: g.title.trim(),
        lifeAreaId: g.lifeAreaId,
        metricLabel: g.metricLabel.trim(),
        targetValue: Number(g.targetValue) || 1,
        deadlineWeek: Math.min(12, Math.max(1, Number(g.deadlineWeek) || 12)),
      }));
    completeOnboarding({ goals: validGoals });
    router.replace("/");
  }

  if (step === "intro") {
    return <WelcomePage onStart={() => setStep("areas")} />;
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-5 py-10 onboarding-grid">
      <div className="w-full max-w-[560px]">
        <div className="flex items-center gap-1.5 mb-8 justify-center">
          {(["intro", "areas", "vision", "goals"] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1 w-10 rounded-full ${
                stepIndex(step) >= stepIndex(s) ? "bg-accent-dark" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === "areas" && (
          <Card className="p-7">
            <h2 className="text-[20px] font-semibold mb-1">Сферы жизни</h2>
            <p className="text-[14px] text-text-secondary mb-5">
              Выберите, что для вас сейчас актуально. Остальное можно скрыть — вы всегда сможете вернуться к этому в настройках.
            </p>
            <div className="flex flex-col gap-1">
              {lifeAreas.map((area) => (
                <label
                  key={area.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[10px] hover:bg-muted cursor-pointer"
                >
                  <span className="text-[14px] text-text-primary">{area.title}</span>
                  <input
                    type="checkbox"
                    checked={!area.hidden}
                    onChange={(e) => toggleArea(area.id, !e.target.checked)}
                    className="h-4 w-4 accent-[#1F1F1F]"
                  />
                </label>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button className="btn-ghost" onClick={() => setStep("intro")}>
                Назад
              </button>
              <button className="btn-primary" onClick={() => setStep("vision")}>
                Далее
              </button>
            </div>
          </Card>
        )}

        {step === "vision" && (
          <Card className="p-7">
            <h2 className="text-[20px] font-semibold mb-1">Видение на 3–5 лет</h2>
            <p className="text-[14px] text-text-secondary mb-5">
              Где вы хотите быть в каждой сфере? Можно пропустить и заполнить позже.
            </p>
            <div className="flex flex-col gap-4 max-h-[320px] overflow-auto pr-1">
              {visibleAreas.map((area) => (
                <div key={area.id}>
                  <div className="text-[13px] font-medium text-text-primary mb-1.5">{area.title}</div>
                  <textarea
                    value={area.vision ?? ""}
                    onChange={(e) => setVision(area.id, e.target.value)}
                    placeholder="Где я хочу быть через 3–5 лет?"
                    rows={2}
                    className="input-plain w-full resize-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button className="btn-ghost" onClick={() => setStep("areas")}>
                Назад
              </button>
              <button className="btn-primary" onClick={() => setStep("goals")}>
                Далее
              </button>
            </div>
          </Card>
        )}

        {step === "goals" && (
          <Card className="p-7">
            <h2 className="text-[20px] font-semibold mb-1">Фокус на ближайшие 12 недель</h2>
            <p className="text-[14px] text-text-secondary mb-2">
              Что из вашего видения важно приблизить именно сейчас? Выберите 3–5 целей.
            </p>
            <p className="text-[12px] text-text-secondary mb-5">
              Хорошая цель: «Тренироваться минимум 3 раза в неделю на протяжении 12 недель», а не просто «Стать здоровее».
            </p>
            <div className="flex flex-col gap-3 max-h-[360px] overflow-auto pr-1">
              {goals.map((g, i) => (
                <div key={i} className="border border-border rounded-[12px] p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <input
                      value={g.title}
                      onChange={(e) => updateGoal(i, { title: e.target.value })}
                      placeholder={`Цель ${i + 1}`}
                      className="input-plain flex-1"
                    />
                    <button
                      onClick={() => removeGoalRow(i)}
                      className="text-text-secondary text-[13px] px-2 py-2"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={g.lifeAreaId ?? ""}
                      onChange={(e) => updateGoal(i, { lifeAreaId: e.target.value || null })}
                      className="input-plain flex-1 text-[13px]"
                    >
                      <option value="">Сфера</option>
                      {visibleAreas.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title}
                        </option>
                      ))}
                    </select>
                    <input
                      value={g.metricLabel}
                      onChange={(e) => updateGoal(i, { metricLabel: e.target.value })}
                      placeholder="Метрика"
                      className="input-plain flex-1 text-[13px]"
                    />
                    <input
                      value={g.targetValue}
                      onChange={(e) => updateGoal(i, { targetValue: e.target.value })}
                      placeholder="Цель (число)"
                      className="input-plain w-[100px] text-[13px]"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addGoalRow} className="text-[13px] text-text-secondary mt-3 hover:text-text-primary">
              + Добавить ещё цель
            </button>
            <div className="flex justify-between mt-6">
              <button className="btn-ghost" onClick={() => setStep("vision")}>
                Назад
              </button>
              <button className="btn-primary" onClick={finish}>
                Создать цикл
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function WelcomePage({ onStart }: { onStart: () => void }) {
  return (
    <main className="welcome-page min-h-screen overflow-hidden">
      <div className="welcome-orb welcome-orb-one" />
      <div className="welcome-orb welcome-orb-two" />

      <nav className="relative z-10 mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 py-6 md:px-10 md:py-8">
        <div className="flex items-center gap-3" aria-label="Life Cycle">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#20342c] text-white shadow-[0_8px_20px_rgba(32,52,44,0.18)]">
            <CycleMark />
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#20342c]">Life Cycle</span>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="hidden rounded-full border border-[#20342c]/15 bg-white/70 px-4 py-2 text-[13px] font-medium text-[#20342c] backdrop-blur-sm transition hover:border-[#20342c]/30 hover:bg-white sm:block"
        >
          Начать настройку
        </button>
      </nav>

      <section className="relative z-10 mx-auto grid w-full max-w-[1180px] items-center gap-14 px-5 pb-16 pt-12 md:px-10 md:pb-24 md:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        <div className="welcome-reveal max-w-[580px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6f836f]/20 bg-white/60 px-3 py-1.5 text-[12px] font-medium text-[#526654] backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-[#91a47e]" />
            Один фокус. Двенадцать недель.
          </div>

          <h1 className="welcome-title text-[44px] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d2924] min-[420px]:text-[50px] sm:text-[64px] lg:text-[76px]">
            Меньше планов.
            <span className="block font-serif font-normal italic text-[#72806a]">Больше жизни.</span>
          </h1>

          <p className="mt-7 max-w-[510px] text-[17px] leading-7 text-[#64706a] md:text-[18px]">
            Превратите далёкие цели в спокойный ритм: выберите главное на 12 недель, действуйте каждый день и замечайте реальный прогресс.
          </p>

          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onStart}
              className="group inline-flex items-center gap-3 rounded-full bg-[#20342c] px-6 py-3.5 text-[14px] font-medium text-white shadow-[0_14px_30px_rgba(32,52,44,0.2)] transition hover:-translate-y-0.5 hover:bg-[#29443a]"
            >
              Создать свой цикл
              <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </button>
            <span className="text-[13px] text-[#7a847f]">Настройка займёт около 3 минут</span>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3 border-t border-[#20342c]/10 pt-6">
            {[
              ["01", "Выберите\nнаправление"],
              ["02", "Соберите\nцикл"],
              ["03", "Двигайтесь\nпо неделям"],
            ].map(([number, label]) => (
              <div key={number} className="flex min-w-0 gap-2 sm:gap-2.5">
                <span className="pt-0.5 font-mono text-[10px] text-[#92a08f]">{number}</span>
                <span className="whitespace-pre-line text-[11px] leading-4 text-[#56635c] sm:text-[12px]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="welcome-reveal welcome-reveal-delay relative mx-auto w-full max-w-[590px]" aria-label="Пример экрана недельного цикла">
          <div className="absolute -left-5 top-14 hidden rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_16px_50px_rgba(55,70,61,0.1)] backdrop-blur-md sm:block">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#e6eee0] text-[12px]">✓</span>
              <div>
                <div className="text-[10px] text-[#8a938e]">Сегодня</div>
                <div className="text-[11px] font-medium text-[#314038]">3 главных шага</div>
              </div>
            </div>
          </div>

          <div className="welcome-dashboard rotate-[1.5deg] rounded-[28px] border border-white/90 bg-white/78 p-3 shadow-[0_35px_90px_rgba(54,70,60,0.14)] backdrop-blur-xl sm:p-5">
            <div className="rounded-[21px] border border-[#dde4dc] bg-[#fbfcf9] p-5 sm:p-7">
              <div className="mb-8 flex items-start justify-between">
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#89948d]">Текущий цикл</div>
                  <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[#26352d] sm:text-[24px]">Сильное и спокойное начало</h2>
                </div>
                <span className="rounded-full bg-[#edf2e9] px-3 py-1 text-[10px] font-medium text-[#64735f]">Неделя 4 / 12</span>
              </div>

              <div className="mb-2 flex items-end justify-between">
                <span className="text-[11px] text-[#7e8882]">Прогресс цикла</span>
                <span className="font-mono text-[11px] text-[#4c5d53]">34%</span>
              </div>
              <div className="mb-8 h-2 overflow-hidden rounded-full bg-[#e8ece6]">
                <div className="h-full w-[34%] rounded-full bg-[#7f9874]" />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  ["Движение", "8 / 12", "66%"],
                  ["Проект", "3 / 6", "50%"],
                  ["Тишина", "18 дней", "75%"],
                ].map(([title, value, width], index) => (
                  <div key={title} className="rounded-xl border border-[#e2e7e0] bg-white p-3 sm:p-4">
                    <div className="mb-4 flex size-7 items-center justify-center rounded-lg bg-[#f0f3ed] text-[11px] text-[#70806f]">
                      {index === 0 ? "↗" : index === 1 ? "◇" : "○"}
                    </div>
                    <div className="text-[10px] text-[#8a938e] sm:text-[11px]">{title}</div>
                    <div className="mt-1 text-[12px] font-semibold text-[#34443b] sm:text-[14px]">{value}</div>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#edf0eb]">
                      <div className="h-full rounded-full bg-[#9bad8e]" style={{ width }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-[#e2e7e0] bg-white px-4 py-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#48564e]">Ритм недели</span>
                  <span className="text-[10px] text-[#8a938e]">5 дней в фокусе</span>
                </div>
                <div className="flex items-end gap-1.5">
                  {[42, 66, 48, 82, 72, 28, 18].map((height, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-12 w-full items-end overflow-hidden rounded-sm bg-[#f0f2ee]">
                        <div
                          className={`w-full rounded-sm ${index < 5 ? "bg-[#a2b497]" : "bg-[#dfe5dc]"}`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-[#9aa19d]">{["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 right-1 rounded-2xl border border-white/90 bg-[#263b32] px-4 py-3 text-white shadow-[0_18px_45px_rgba(38,59,50,0.2)] sm:right-6">
            <div className="text-[9px] uppercase tracking-[0.16em] text-white/55">Главное</div>
            <div className="mt-1 text-[12px]">Не успеть всё. Успеть важное.</div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CycleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M14.6 6.25A6 6 0 1 0 15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="m12.6 3.9 2.25 2.25-3 .55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="9" r="1.65" fill="currentColor" />
    </svg>
  );
}

function stepIndex(step: Step): number {
  return ["intro", "areas", "vision", "goals", "finish"].indexOf(step);
}
