"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { QuickAddModal } from "./QuickAddModal";

const ITEMS = [
  { href: "/", label: "Today" },
  { href: "/week", label: "Week" },
];

const MORE_ITEMS = [
  { href: "/cycle", label: "12 Weeks" },
  { href: "/projects", label: "Projects" },
  { href: "/habits", label: "Habits" },
  { href: "/review", label: "Review" },
  { href: "/inbox", label: "Inbox" },
  { href: "/settings", label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-border flex items-center justify-around py-2 z-40">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 text-center text-[12px] py-1.5 ${
              isActive(item.href) ? "text-text-primary font-medium" : "text-text-secondary"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <button
          onClick={() => setQuickAddOpen(true)}
          className="flex-1 flex justify-center"
          aria-label="Quick add"
        >
          <span className="h-8 w-8 rounded-full bg-accent-dark text-white flex items-center justify-center text-[18px] leading-none">
            +
          </span>
        </button>
        <Link
          href="/calendar"
          className={`flex-1 text-center text-[12px] py-1.5 ${
            isActive("/calendar") ? "text-text-primary font-medium" : "text-text-secondary"
          }`}
        >
          Calendar
        </Link>
        <button
          onClick={() => setMoreOpen(true)}
          className="flex-1 text-center text-[12px] py-1.5 text-text-secondary"
        >
          More
        </button>
      </nav>

      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="relative w-full bg-surface rounded-t-2xl p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-10 bg-border rounded-full mx-auto mb-4" />
            <div className="flex flex-col">
              {MORE_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="px-3 py-3 text-[15px] text-text-primary rounded-[10px] hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}
