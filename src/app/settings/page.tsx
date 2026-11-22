"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, SectionLabel } from "@/components/ui";

export default function SettingsPage() {
  const lifeAreas = useStore((s) => s.lifeAreas);
  const updateLifeArea = useStore((s) => s.updateLifeArea);
  const reorderLifeAreas = useStore((s) => s.reorderLifeAreas);
  const cycle = useStore((s) => s.cycle);
  const startNewCycle = useStore((s) => s.startNewCycle);

  const [confirmingReset, setConfirmingReset] = useState(false);
  const [confirmingNewCycle, setConfirmingNewCycle] = useState(false);

  const sorted = [...lifeAreas].sort((a, b) => a.order - b.order);

  function move(id: string, dir: -1 | 1) {
    const ids = sorted.map((a) => a.id);
    const idx = ids.indexOf(id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= ids.length) return;
    [ids[idx], ids[newIdx]] = [ids[newIdx], ids[idx]];
    reorderLifeAreas(ids);
  }

  function exportData() {
    const data = localStorage.getItem("lifeos-storage");
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeos-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetAll() {
    localStorage.removeItem("lifeos-storage");
    window.location.reload();
  }

  return (
    <div className="pt-6 pb-10">
      <h1 className="text-[24px] font-semibold mb-6">Settings</h1>

      <SectionLabel>Сферы жизни</SectionLabel>
      <Card className="p-2 mb-8">
        {sorted.map((area, i) => (
          <div key={area.id} className="flex items-center gap-2 px-3 py-2.5">
            <div className="flex flex-col -gap-1">
              <button
                onClick={() => move(area.id, -1)}
                disabled={i === 0}
                className="text-text-secondary hover:text-text-primary disabled:opacity-20 text-[11px] leading-none"
              >
                ▲
              </button>
              <button
                onClick={() => move(area.id, 1)}
                disabled={i === sorted.length - 1}
                className="text-text-secondary hover:text-text-primary disabled:opacity-20 text-[11px] leading-none"
              >
                ▼
              </button>
            </div>
            <div className="flex-1 text-[14px] text-text-primary">{area.title}</div>
            <label className="flex items-center gap-2 text-[12px] text-text-secondary">
              Видна
              <input
                type="checkbox"
                checked={!area.hidden}
                onChange={(e) => updateLifeArea(area.id, { hidden: !e.target.checked })}
                className="h-4 w-4 accent-[#1F1F1F]"
              />
            </label>
          </div>
        ))}
      </Card>

      <SectionLabel>Цикл</SectionLabel>
      <Card className="p-4 mb-8">
        {cycle && (
          <div className="text-[13px] text-text-secondary mb-3">
            Текущий цикл: {new Date(cycle.startDate).toLocaleDateString("ru-RU")} —{" "}
            {new Date(cycle.endDate).toLocaleDateString("ru-RU")}
          </div>
        )}
        {confirmingNewCycle ? (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-text-secondary">
              Текущие цели и проекты будут архивированы. Начать новый цикл?
            </span>
            <button
              onClick={() => {
                startNewCycle();
                setConfirmingNewCycle(false);
              }}
              className="text-[13px] text-accent-dark font-medium"
            >
              Да
            </button>
            <button onClick={() => setConfirmingNewCycle(false)} className="text-[13px] text-text-secondary">
              Отмена
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirmingNewCycle(true)} className="btn-ghost text-[13px]">
            Начать новый 12-недельный цикл
          </button>
        )}
      </Card>

      <SectionLabel>Данные и приватность</SectionLabel>
      <Card className="p-4">
        <p className="text-[13px] text-text-secondary mb-4">
          Данные хранятся локально в вашем браузере и не передаются на сервер.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={exportData} className="btn-ghost text-[13px]">
            Экспортировать данные
          </button>
          {confirmingReset ? (
            <>
              <span className="text-[13px] text-text-secondary">Удалить все данные без возможности восстановления?</span>
              <button onClick={resetAll} className="text-[13px] text-accent-dark font-medium">
                Да, удалить всё
              </button>
              <button onClick={() => setConfirmingReset(false)} className="text-[13px] text-text-secondary">
                Отмена
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmingReset(true)} className="text-[13px] text-text-secondary hover:text-text-primary">
              Сбросить все данные
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
