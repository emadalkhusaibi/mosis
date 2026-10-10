"use client";
import { Dialog } from "radix-ui";
import { X } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";

/**
 * Modal dialog: a bottom sheet on phones, a centred dialog on larger screens.
 * Radix traps focus, closes on Escape, makes the background inert and returns
 * focus to the trigger. The body scrolls; the footer stays reachable.
 */
export function Sheet({ open, onOpenChange, title, description, children, footer, size = "md", onSubmit }: { open: boolean; onOpenChange: (o: boolean) => void; title: ReactNode; description?: ReactNode; children: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg"; onSubmit?: () => void }) {
  const { t, dir } = useI18n();
  const Body = onSubmit ? "form" : "div";
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-scrim" />
        <Dialog.Content className={clsx("dialog", `dialog-${size}`)} dir={dir} {...(description ? {} : { "aria-describedby": undefined })}>
          <Body
            className="contents"
            {...(onSubmit ? { noValidate: true, onSubmit: (e: React.FormEvent) => { e.preventDefault(); onSubmit(); } } : {})}
            style={{ display: "contents" }}
          >
            <header className="dialog-header">
              <div className="min-w-0">
                <Dialog.Title className="dialog-title">{title}</Dialog.Title>
                {description && <Dialog.Description className="dialog-description">{description}</Dialog.Description>}
              </div>
              <Dialog.Close className="icon-btn icon-btn-sm" aria-label={t("Close", "إغلاق")}>
                <X size={18} />
              </Dialog.Close>
            </header>
            <div className="dialog-body">{children}</div>
            {footer && <footer className="dialog-footer">{footer}</footer>}
          </Body>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
