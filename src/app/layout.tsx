import type { Metadata } from "next";
import "./globals.css";
import { StoreHydration } from "./providers";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Система управления жизнью на основе 12-недельного цикла",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full bg-bg text-text-primary">
        <StoreHydration>
          <AppShell>{children}</AppShell>
        </StoreHydration>
      </body>
    </html>
  );
}
