"use client";
import { useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { Hub } from "@/components/shell/hub";
import { FieldTask } from "@/components/prove/actions";
import { evidenceSummary } from "@/domain/evidence";
import { lessons } from "@/content/lessons";

const noop = () => () => {};

export default function ProveHub() {
  const { t } = useI18n();
  const { state: s } = useWorkspace();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const ev = evidenceSummary(s);
  return (
    <Hub id="prove" values={{
      "/prove/tests": t(`${ev.done} done`, `${ev.done} منجز`),
      "/prove/review": mounted ? (ev.reviewedThisWeek ? t("Done for this week", "أُنجزت لهذا الأسبوع") : t("Due", "مستحقة")) : null,
      "/practice": <span className="num">{s.decisions.length}</span>,
      "/learn": <span className="num">{s.learning.completed.length}/{lessons.length}</span>,
    }} after={<FieldTask />} />
  );
}
