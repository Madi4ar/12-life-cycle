"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, EmptyState } from "@/components/ui";
import type { InboxCategory } from "@/lib/types";

const CATEGORIES: { key: InboxCategory; label: string }[] = [
  { key: "task", label: "Задача" },
  { key: "idea", label: "Идея" },
  { key: "project", label: "Проект" },
  { key: "note", label: "Заметка" },
  { key: "goal", label: "Цель" },
  { key: "someday", label: "Когда-нибудь" },
];

export default function InboxPage() {
  const items = useStore((s) => s.inboxItems);
  const addInboxItem = useStore((s) => s.addInboxItem);
  const categorizeInboxItem = useStore((s) => s.categorizeInboxItem);
  const removeInboxItem = useStore((s) => s.removeInboxItem);
  const addTask = useStore((s) => s.addTask);
  const addProject = useStore((s) => s.addProject);
  const addGoal = useStore((s) => s.addGoal);

  const [text, setText] = useState("");
  const [showProcessed, setShowProcessed] = useState(false);

  const unprocessed = items.filter((i) => !i.processed);
  const processed = items.filter((i) => i.processed);

  function capture() {
    if (!text.trim()) return;
    addInboxItem(text.trim());
    setText("");
  }

  function categorize(id: string, text: string, category: InboxCategory) {
    categorizeInboxItem(id, category);
    if (category === "task") {
      addTask({ title: text, type: "operational" });
    } else if (category === "project") {
      addProject(text, null);
    } else if (category === "goal") {
      addGoal({ lifeAreaId: null, title: text, metricLabel: "", targetValue: 1, deadlineWeek: 12 });
    }
  }

  return (
    <div className="pt-6 pb-10">
      <h1 className="text-[24px] font-semibold mb-1">Inbox</h1>
      <p className="text-[14px] text-text-secondary mb-5">Что у вас сейчас в голове?</p>

      <div className="mb-8">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && capture()}
          placeholder="позвонить бухгалтеру, идея нового курса, купить билеты…"
          className="input-plain w-full text-[15px] py-3"
          autoFocus
        />
        <div className="text-[12px] text-text-secondary mt-1.5">Enter to capture</div>
      </div>

      {unprocessed.length === 0 ? (
        <EmptyState title="Inbox пуст" hint="Отличное чувство контроля" />
      ) : (
        <div className="flex flex-col gap-2">
          {unprocessed.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="text-[14px] text-text-primary mb-3">{item.text}</div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => categorize(item.id, item.text, c.key)}
                    className="px-2.5 py-1 rounded-full text-[12px] bg-muted text-text-secondary hover:bg-accent-soft hover:text-accent-dark"
                  >
                    {c.label}
                  </button>
                ))}
                <button
                  onClick={() => removeInboxItem(item.id)}
                  className="px-2.5 py-1 rounded-full text-[12px] text-text-secondary hover:text-text-primary"
                >
                  Удалить
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {processed.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowProcessed((v) => !v)}
            className="text-[13px] text-text-secondary hover:text-text-primary"
          >
            {showProcessed ? "Скрыть" : "Показать"} обработанные ({processed.length})
          </button>
          {showProcessed && (
            <div className="flex flex-col gap-1 mt-3">
              {processed.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-1 py-1.5 text-[13px] text-text-secondary">
                  <span>{item.text}</span>
                  <span className="text-[11px]">{item.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
