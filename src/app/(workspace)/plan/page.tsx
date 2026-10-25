"use client";
import Link from "next/link";
import { ArrowRight, Check, FileText } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useContent } from "@/state/content";
import { PageHeader, Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { sectionMeta } from "@/content/plan-meta";
import { sectorOf } from "@/content/sectors";
import { planProgress } from "@/domain/progress";

export default function PlanPage() {
  const { sections } = useContent();
  const { t, p } = useI18n();
  const { state } = useWorkspace();
  const prog = planProgress(state);
  const sector = sectorOf(state.venture.sector);
  const nextIdx = prog.sections.findIndex((x) => !x.complete);
  return (
    <>
      <PageHeader
        title={t("Business plan", "خطة العمل")}
        description={t("Seven chapters, one question at a time. Separate what you know from what you're assuming.", "سبعة فصول، سؤال تلو الآخر. افصل ما تعرفه عمّا تفترضه.")}
        action={<Button variant="secondary" href="/plan/document" icon={<FileText size={18} />}>{t("Full plan", "الخطة كاملة")}</Button>}
      />

      <Panel className="plan-summary">
        <div className="plan-summary-text">
          <p className="stat-value">{t(`${prog.done} of ${prog.total} answers`, `${prog.done} من ${prog.total} إجابة`)}</p>
          <p className="field-hint">{t("Focus for your sector", "تركيز قطاعك")}: {p(sector.focus)}</p>
        </div>
        <div className="plan-summary-bar"><ProgressBar value={prog.ratio} label={t("Plan progress", "تقدّم الخطة")} /></div>
        {nextIdx >= 0 && <Button href={`/plan/${sections[nextIdx].id}`} trailing={<ArrowRight size={18} />}>{prog.done === 0 ? t("Start writing", "ابدأ الكتابة") : t("Continue", "تابع")}</Button>}
      </Panel>

      <Panel padded={false}>
        <ol className="chapter-list">
          {sections.map((sec, i) => {
            const m = sectionMeta[sec.id];
            const st = prog.sections[i];
            const status = st.complete ? t("Complete", "مكتمل") : st.done === 0 ? t("Not started", "لم يبدأ") : t("In progress", "قيد الكتابة");
            return (
              <li key={sec.id}>
                <Link href={`/plan/${sec.id}`} className={clsx("chapter-row", st.complete && "is-done", i === nextIdx && "is-next")}>
                  <span className="chapter-row-icon" aria-hidden="true">{st.complete ? <Check size={18} weight="bold" /> : <m.icon size={20} />}</span>
                  <span className="chapter-row-main">
                    <span className="chapter-row-title"><span className="chapter-row-n">{i + 1}</span> {p(sec.name)}</span>
                    <span className="chapter-row-intro">{p(sec.intro)}</span>
                  </span>
                  <span className="chapter-row-meta">
                    <span className="chapter-row-count">{t(`${st.done} of ${st.total}`, `${st.done} من ${st.total}`)}</span>
                    <span className={clsx("chip", st.complete ? "chip-positive" : st.done > 0 && "chip-accent")}>{status}</span>
                  </span>
                  <ArrowRight size={18} className="flip-rtl chapter-row-arrow" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      </Panel>
    </>
  );
}
