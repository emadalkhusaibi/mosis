"use client";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Tooltip } from "radix-ui";
import { LanguageProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/toast";
import type { Lang } from "@/content/words";

export function Providers({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey="moasis-appearance" disableTransitionOnChange>
      <LanguageProvider initial={lang}>
        <MotionConfig reducedMotion="user" transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
          <Tooltip.Provider delayDuration={400}>
            <ToastProvider>{children}</ToastProvider>
          </Tooltip.Provider>
        </MotionConfig>
      </LanguageProvider>
    </ThemeProvider>
  );
}
