"use client";
import Link from "next/link";
import { Morph } from "@/components/ui/morph";
import { ArrowRight, Check, FileText } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { PageHeader, Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { sections } from "@/content/sections";
import { sectionMeta } from "@/content/plan-meta";
import { sectorOf } from "@/content/sectors";
import { planProgress } from "@/domain/progress";

export default function PlanPage() {
  const { t, p } = useI18n();
  const { state } = useWorkspace();
  const prog = planProgress(state);
  const sector = sectorOf(state.venture.sector);
  return (
    <>
      <PageHeader
        eyebrow={t("Business plan", "خطة العمل")}
        title={t("Write the plan you'd *defend*.", "اكتب خطة تستطيع *الدفاع* عنها.")}
        description={t("Seven chapters, one question at a time. Separate what you know from what you're assuming.", "سبعة فصول، سؤال تلو الآخر. افصل ما تعرفه عمّا تفترضه.")}
        action={<Button variant="secondary" href="/plan/document" icon={<FileText size={18} />}>{t("View full plan", "عرض الخطة كاملة")}</Button>}
      />
      <Panel className="plan-summary">
        <ProgressRing value={prog.ratio} size={84} stroke={7} label={t(`${Math.round(prog.ratio * 100)}% complete`, `مكتمل ${Math.round(prog.ratio * 100)}٪`)} />
        <div className="min-w-0 flex-1">
          <p className="stat-value num">{Math.round(prog.ratio * 100)}%</p>
          <p className="muted">{t(`${prog.done} of ${prog.total} answers written for ${state.venture.name}.`, `كُتبت ${prog.done} من ${prog.total} إجابة لـ${state.venture.name}.`)}</p>
          <p className="muted small mt-1">{t("Focus for your sector", "تركيز قطاعك")}: {p(sector.focus)}</p>
        </div>
      </Panel>
      <ol className="chapter-grid">
        {sections.map((sec, i) => {
          const m = sectionMeta[sec.id];
          const st = prog.sections[i];
          return (
            <li key={sec.id}>
              <Link href={`/plan/${sec.id}`} className={clsx("chapter panel", st.complete && "is-done")}>
                <div className="chapter-top">
                  <Morph name={`chapter-icon-${sec.id}`}><span className="chapter-icon"><m.icon size={22} /></span></Morph>
                  <span className="chapter-num num">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h2 className="chapter-title"><Morph name={`chapter-${sec.id}`} kind="morph-text"><span className="vt-text">{p(sec.name)}</span></Morph></h2>
                <p className="chapter-intro">{p(sec.intro)}</p>
                <div className="chapter-foot">
                  <ProgressBar value={st.done / st.total} label={p(sec.name)} tone={st.complete ? "positive" : "ink"} />
                  <span className="chapter-count num">{st.complete ? <Check size={14} weight="bold" /> : `${st.done}/${st.total}`}</span>
                </div>
                <ArrowRight size={18} className="chapter-arrow flip-rtl" />
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
