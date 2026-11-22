"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface Command {
  label: string;
  action: (router: ReturnType<typeof useRouter>) => void;
}

const COMMANDS: Command[] = [
  { label: "Open Today", action: (r) => r.push("/") },
  { label: "Open Week", action: (r) => r.push("/week") },
  { label: "Open 12 Weeks", action: (r) => r.push("/cycle") },
  { label: "Open Projects", action: (r) => r.push("/projects") },
  { label: "Open Calendar", action: (r) => r.push("/calendar") },
  { label: "Open Habits", action: (r) => r.push("/habits") },
  { label: "Review week", action: (r) => r.push("/review") },
  { label: "Open Inbox", action: (r) => r.push("/inbox") },
  { label: "Open Settings", action: (r) => r.push("/settings") },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setQuery("");
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(
    () => COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative w-full max-w-[480px] card p-2" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions…"
          className="w-full px-3 py-2.5 text-[14px] outline-none"
        />
        <div className="h-px bg-border mx-1" />
        <div className="py-1 max-h-[300px] overflow-auto">
          {filtered.map((c) => (
            <button
              key={c.label}
              onClick={() => {
                c.action(router);
                onClose();
              }}
              className="w-full text-left px-3 py-2 rounded-[8px] text-[14px] text-text-primary hover:bg-muted"
            >
              {c.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-3 text-[13px] text-text-secondary">Ничего не найдено</div>
          )}
        </div>
      </div>
    </div>
  );
}
