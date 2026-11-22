"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { getCurrentWeekNumber } from "@/lib/dates";

const MAIN_NAV = [
  { href: "/", label: "Today" },
  { href: "/week", label: "Week" },
  { href: "/cycle", label: "12 Weeks" },
  { href: "/projects", label: "Projects" },
  { href: "/calendar", label: "Calendar" },
  { href: "/habits", label: "Habits" },
  { href: "/review", label: "Review" },
];

const SECONDARY_NAV = [{ href: "/inbox", label: "Inbox" }];

export function Sidebar() {
  const pathname = usePathname();
  const cycle = useStore((s) => s.cycle);
  const inboxCount = useStore((s) => s.inboxItems.filter((i) => !i.processed).length);
  const week = cycle ? getCurrentWeekNumber(cycle) : 1;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="hidden md:flex md:w-[216px] shrink-0 flex-col border-r border-border bg-bg px-4 py-6">
      <div className="px-2 mb-8">
        <div className="text-[15px] font-semibold text-text-primary">LifeOS</div>
        {cycle && (
          <div className="text-[12px] text-text-secondary mt-0.5">Week {week} of 12</div>
        )}
      </div>

      <nav className="flex flex-col gap-0.5">
        {MAIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-[10px] px-3 py-2 text-[14px] transition-colors ${
              isActive(item.href)
                ? "bg-muted text-text-primary font-medium"
                : "text-text-secondary hover:bg-muted/70"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="h-px bg-border my-4" />

      <nav className="flex flex-col gap-0.5">
        {SECONDARY_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-[10px] px-3 py-2 text-[14px] flex items-center justify-between transition-colors ${
              isActive(item.href)
                ? "bg-muted text-text-primary font-medium"
                : "text-text-secondary hover:bg-muted/70"
            }`}
          >
            <span>{item.label}</span>
            {inboxCount > 0 && (
              <span className="text-[11px] text-text-secondary">{inboxCount}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <Link
          href="/settings"
          className={`rounded-[10px] px-3 py-2 text-[14px] block transition-colors ${
            isActive("/settings")
              ? "bg-muted text-text-primary font-medium"
              : "text-text-secondary hover:bg-muted/70"
          }`}
        >
          Settings
        </Link>
      </div>
    </aside>
  );
}
