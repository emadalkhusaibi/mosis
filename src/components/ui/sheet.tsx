"use client";
import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import clsx from "clsx";

/**
 * Overlay glass. A bottom sheet on phones, a centred panel on larger screens.
 * Focus is trapped and returned to the trigger by Radix.
 */
export function Sheet({ open, onOpenChange, title, description, children, footer, size = "md" }: { open: boolean; onOpenChange: (o: boolean) => void; title: ReactNode; description?: ReactNode; children: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg" }) {
  const { t, dir } = useI18n();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="sheet-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount dir={dir} aria-describedby={description ? undefined : undefined}>
              <motion.div
                className={clsx("sheet", `sheet-${size}`)}
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.16 } }}
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              >
                <div className="sheet-grabber" aria-hidden="true" />
                <header className="sheet-header">
                  <div className="min-w-0">
                    <Dialog.Title className="sheet-title">{title}</Dialog.Title>
                    {description ? <Dialog.Description className="sheet-description">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
                  </div>
                  <Dialog.Close className="icon-btn icon-btn-glass icon-btn-sm" aria-label={t("Close", "إغلاق")}>
                    <X size={16} weight="bold" />
                  </Dialog.Close>
                </header>
                <div className="sheet-body">{children}</div>
                {footer && <footer className="sheet-footer">{footer}</footer>}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
