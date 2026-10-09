"use client";
import Link from "next/link";
import { Morph } from "@/components/ui/morph";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpenText, ChartLineUp, Check, Lightbulb } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { sections } from "@/content/sections";
import { sectionMeta } from "@/content/plan-meta";
import { lessons } from "@/content/lessons";
import { sectorOf } from "@/content/sectors";
import { MIN_ANSWER, answered, planProgress } from "@/domain/progress";

export default function PlanSectionPage() {
  const { section } = useParams<{ section: string }>();
  const { t, p } = useI18n();
  const { state, update } = useWorkspace();
  const idx = sections.findIndex((s) => s.id === section);
  if (idx < 0) notFound();
  const sec = sections[idx];
  const meta = sectionMeta[sec.id];
  const prog = planProgress(state).sections[idx];
  const prev = sections[idx - 1];
  const next = sections[idx + 1];
  const sector = sectorOf(state.venture.sector);
  const related = meta.lessons.map((id) => lessons.find((l) => l.id === id)!).filter(Boolean);

  return (
    <div className="plan-section">
      <nav className="crumbs" aria-label={t("Breadcrumb", "مسار التنقل")}>
        <Link href="/plan"><ArrowLeft size={15} className="flip-rtl" />{t("Business plan", "خطة العمل")}</Link>
      </nav>
      <header className="page-header">
        <div className="min-w-0">
          <Morph name={`chapter-icon-${sec.id}`}><span className="chapter-icon chapter-icon-lg"><meta.icon size={26} /></span></Morph>
          <p className="eyebrow">{t(`Chapter ${idx + 1} of ${sections.length}`, `الفصل ${idx + 1} من ${sections.length}`)}</p>
          <h1 className="page-title"><Morph name={`chapter-${sec.id}`} kind="morph-text"><span className="vt-text">{p(sec.name)}</span></Morph></h1>
          <p className="page-description">{p(sec.intro)}</p>
        </div>
      </header>

      <div className="plan-layout">
        <div className="plan-questions">
          {sec.questions.map((q, qi) => {
            const value = state.answers[q.key] ?? "";
            const done = answered(state, q.key);
            const id = `q-${q.key}`;
            return (
              <Panel key={q.key} className={clsx("question", done && "is-done")}>
                <div className="question-head">
                  <span className={clsx("question-num num", done && "is-done")} aria-hidden="true">{done ? <Check size={13} weight="bold" /> : qi + 1}</span>
                  <div className="min-w-0">
                    <label htmlFor={id} className="question-label">{p(q.label)}{q.optional && <span className="field-optional">{t("Optional", "اختياري")}</span>}</label>
                    <p id={`${id}-hint`} className="question-hint">{p(q.hint)}</p>
                  </div>
                </div>
                <textarea
                  id={id}
                  aria-describedby={`${id}-hint`}
                  className="input textarea question-input"
                  value={value}
                  maxLength={4000}
                  rows={value.length > 240 ? 7 : 4}
                  placeholder={t("Write in your own words…", "اكتب بكلماتك…")}
                  onChange={(e) => update((s) => ({ ...s, answers: { ...s.answers, [q.key]: e.target.value } }))}
                />
                <div className="question-foot">
                  <span>{value.trim().length === 0 ? "" : value.trim().length < MIN_ANSWER ? t("Add a little more detail.", "أضف تفصيلاً أكثر.") : t("Saved", "محفوظ")}</span>
                  <span className="num">{value.length}/4000</span>
                </div>
              </Panel>
            );
          })}

          <div className="section-nav">
            {prev ? <Button variant="ghost" href={`/plan/${prev.id}`} icon={<ArrowLeft size={18} className="flip-rtl" />}>{p(prev.name)}</Button> : <span />}
            {next ? <Button href={`/plan/${next.id}`} trailing={<ArrowRight size={18} />}>{p(next.name)}</Button> : <Button href="/plan/document" trailing={<ArrowRight size={18} />}>{t("Review full plan", "راجع الخطة كاملة")}</Button>}
          </div>
        </div>

        <aside className="plan-aside">
          <Panel>
            <PanelHeader level={3} title={t("Chapter progress", "تقدّم الفصل")} />
            <ProgressBar value={prog.done / prog.total} label={t("Chapter progress", "تقدّم الفصل")} tone={prog.complete ? "positive" : "ink"} />
            <p className="muted small mt-2">{t(`${prog.done} of ${prog.total} answered`, `${prog.done} من ${prog.total} مُجاب`)}</p>
          </Panel>
          <Panel className="guide-card">
            <span className="guide-icon"><Lightbulb size={18} /></span>
            <h3 className="panel-title text-base">{t("For your sector", "لقطاعك")}</h3>
            <p className="small muted">{p(sector.focus)}</p>
            <p className="small mt-2"><strong>{t("Field test", "اختبار ميداني")}:</strong> {p(sector.test)}</p>
          </Panel>
          {meta.forecast && (
            <Link href="/forecast" className="aside-link panel">
              <ChartLineUp size={20} />
              <span className="min-w-0 flex-1"><strong>{t("Open the forecast", "افتح التوقعات")}</strong><span className="block muted small">{t("Test price, cost and demand against your cash.", "اختبر السعر والتكلفة والطلب مقابل نقدك.")}</span></span>
              <ArrowRight size={16} className="flip-rtl" />
            </Link>
          )}
          <Panel>
            <PanelHeader level={3} title={t("Helpful lessons", "دروس مفيدة")} />
            <ul className="list">
              {related.map((l) => (
                <li key={l.id}>
                  <Link href={`/learn/${l.id}`} className="row">
                    <span className="row-icon"><BookOpenText size={18} /></span>
                    <span className="row-main"><span className="row-title">{p(l.title)}</span><span className="row-sub">{state.learning.completed.includes(l.id) ? t("Completed", "مكتمل") : t(`${l.minutes} min`, `${l.minutes} دقائق`)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
