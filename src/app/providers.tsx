"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.resolve(useStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      useStore.getState().seedLifeAreas();
    }
  }, [hydrated]);

  if (!hydrated) {
    return <div className="min-h-screen bg-bg" />;
  }

  return <>{children}</>;
}
