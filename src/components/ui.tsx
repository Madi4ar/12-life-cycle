"use client";

import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[12px] font-medium tracking-wide text-text-secondary uppercase mb-3">
      {children}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[12px] text-text-secondary mb-1">{label}</div>
      <div className="text-[28px] font-semibold text-text-primary leading-none">{value}</div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-10 text-center">
      <div className="text-[15px] text-text-secondary">{title}</div>
      {hint && <div className="text-[13px] text-text-secondary/70 mt-1">{hint}</div>}
    </div>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "strategic" | "meeting" | "personal" | "habit";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-muted text-text-secondary",
    strategic: "bg-accent-soft text-accent-dark",
    meeting: "bg-(--color-meeting)/15 text-text-primary",
    personal: "bg-(--color-personal)/15 text-text-primary",
    habit: "bg-muted text-text-secondary",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={checked}
      className={`h-5 w-5 shrink-0 rounded-[6px] border flex items-center justify-center transition-colors ${
        checked ? "bg-accent-dark border-accent-dark" : "border-border bg-surface"
      }`}
    >
      {checked && (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1 4.3L4 7.3L10 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
