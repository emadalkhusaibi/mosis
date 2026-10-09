"use client";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Tooltip } from "radix-ui";
import { LanguageProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/toast";
import { Ambient } from "@/components/shell/ambient";
import type { Lang } from "@/content/words";

export function Providers({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey="moasis-appearance" disableTransitionOnChange>
      <LanguageProvider initial={lang}>
        <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 380, damping: 34 }}>
          <Tooltip.Provider delayDuration={400}>
            <ToastProvider><Ambient />{children}</ToastProvider>
          </Tooltip.Provider>
        </MotionConfig>
      </LanguageProvider>
    </ThemeProvider>
  );
}
