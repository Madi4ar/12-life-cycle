"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { QuickAddModal } from "./QuickAddModal";
import { CommandPalette } from "./CommandPalette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const onboarded = useStore((s) => s.onboarded);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (!onboarded && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [onboarded, pathname, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const isChromeless = pathname === "/onboarding" || pathname.startsWith("/focus/");

  if (isChromeless) {
    return <>{children}</>;
  }

  if (!onboarded) {
    return <div className="min-h-screen bg-bg" />;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <div className="hidden md:flex justify-end items-center px-8 pt-6 gap-2">
          <button onClick={() => setPaletteOpen(true)} className="btn-ghost text-[13px]">
            ⌘K Search
          </button>
          <button onClick={() => setQuickAddOpen(true)} className="btn-primary text-[13px]">
            + Add
          </button>
        </div>
        <main className="px-5 md:px-8 pb-24 md:pb-10 pt-4 md:pt-2 max-w-[880px]">{children}</main>
      </div>
      <MobileNav />
      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
