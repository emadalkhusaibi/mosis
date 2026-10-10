"use client";
import { ArrowsClockwise, CloudCheck, HardDrives, Warning } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";

/**
 * Save state for an editing surface. Shows nothing until the person has edited
 * here, then reports only what the storage layer has confirmed.
 */
export function SaveIndicator({ touched }: { touched: boolean }) {
  const { t } = useI18n();
  const { status, retry } = useWorkspace();
  if (!touched) return <p className="save-status" role="status" />;
  const view =
    status === "saving" || status === "loading" ? { I: ArrowsClockwise, text: t("Saving…", "جارٍ الحفظ…"), bad: false }
    : status === "local" ? { I: HardDrives, text: t("Saved on this device", "محفوظ على هذا الجهاز"), bad: false }
    : status === "saved" ? { I: CloudCheck, text: t("Saved to your account", "محفوظ في حسابك"), bad: false }
    : status === "offline" ? { I: Warning, text: t("Offline. Your changes will be retried.", "غير متصل. ستُعاد محاولة الحفظ."), bad: true }
    : status === "conflict" ? { I: Warning, text: t("A newer version exists elsewhere.", "توجد نسخة أحدث في مكان آخر."), bad: true }
    : { I: Warning, text: t("Couldn't save.", "تعذّر الحفظ."), bad: true };
  return (
    <p className={view.bad ? "save-status is-error" : "save-status"} role="status">
      <view.I size={16} aria-hidden="true" />
      <span>{view.text}</span>
      {status === "error" && <button type="button" className="link" onClick={retry}>{t("Retry", "إعادة المحاولة")}</button>}
    </p>
  );
}
