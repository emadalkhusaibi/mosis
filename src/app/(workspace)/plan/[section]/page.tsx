"use client";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenText, ChartLineUp, Check } from "@phosphor-icons/react";
import clsx from "clsx";
import { arMinutes, useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useContent } from "@/state/content";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { sectionMeta } from "@/content/plan-meta";
import { sectorOf } from "@/content/sectors";
import { MIN_ANSWER, answered, planProgress } from "@/domain/progress";

const LIMIT = 4000;

export default function PlanSectionPage() {
  const { sections, lessons } = useContent();
  const { section } = useParams<{ section: string }>();
  const router = useRouter();
  const { t, p } = useI18n();
  const { state, update } = useWorkspace();
  const [touched, setTouched] = useState(false);
  const idx = sections.findIndex((s) => s.id === section);
  if (idx < 0) notFound();
  const sec = sections[idx];
  const meta = sectionMeta[sec.id];
  const plan = planProgress(state);
  const prog = plan.sections[idx];
  const prev = sections[idx - 1];
  const next = sections[idx + 1];
  const sector = sectorOf(state.venture.sector);
  const related = meta.lessons.map((id) => lessons.find((l) => l.id === id)).filter((l) => l !== undefined);

  return (
    <div className="plan-editor">
      <nav className="plan-outline" aria-label={t("Chapters", "الفصول")}>
        <Link href="/plan" className="link-quiet small plan-outline-back"><ArrowLeft size={14} className="flip-rtl" aria-hidden="true" /> {t("Overview", "نظرة عامة")}</Link>
        <ol>
          {sections.map((s, i) => (
            <li key={s.id}>
              <Link href={`/plan/${s.id}`} aria-current={i === idx ? "page" : undefined} className={clsx(plan.sections[i].complete && "is-done")}>
                <span className="chapter-mini-n" aria-hidden="true">{plan.sections[i].complete ? <Check size={11} weight="bold" /> : i + 1}</span>
                <span>{p(s.name)}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="plan-doc-column">
        <div className="plan-picker">
          <label htmlFor="chapter-picker" className="sr-only">{t("Chapter", "الفصل")}</label>
          <select id="chapter-picker" className="input" value={sec.id} onChange={(e) => router.push(`/plan/${e.target.value}`)}>
            {sections.map((s, i) => <option key={s.id} value={s.id}>{i + 1}. {p(s.name)}</option>)}
          </select>
        </div>

        <header className="plan-chapter-head">
          <p className="page-kicker">{t(`Chapter ${idx + 1} of ${sections.length}`, `الفصل ${idx + 1} من ${sections.length}`)} · {t(`${prog.done} of ${prog.total} answered`, `${prog.done} من ${prog.total} مُجاب`)}</p>
          <h1 className="page-title">{p(sec.name)}</h1>
          <p className="page-description">{p(sec.intro)}</p>
          <SaveIndicator touched={touched} />
        </header>

        <ol className="question-list">
          {sec.questions.map((q, qi) => {
            const value = state.answers[q.key] ?? "";
            const done = answered(state, q.key);
            const id = `q-${q.key}`;
            const left = LIMIT - value.length;
            const short = value.trim().length > 0 && value.trim().length < MIN_ANSWER;
            return (
              <li key={q.key} className="question">
                <label htmlFor={id} className="question-label">
                  <span className={clsx("question-n", done && "is-done")} aria-hidden="true">{done ? <Check size={12} weight="bold" /> : qi + 1}</span>
                  <span>{p(q.label)}{q.specific ? <span className="field-optional"> {t("For your business", "خاص بمشروعك")}</span> : q.optional && <span className="field-optional"> {t("Optional", "اختياري")}</span>}</span>
                </label>
                <p id={`${id}-hint`} className="question-hint">
                  {p(q.hint)}
                  {q.example && <span className="question-example"><span className="question-example-k">{t("For example", "مثال")}</span> {p(q.example)}</span>}
                </p>
                <textarea
                  id={id}
                  aria-describedby={`${id}-hint${short || left <= 400 ? ` ${id}-foot` : ""}`}
                  dir="auto"
                  className="input textarea question-input"
                  value={value}
                  maxLength={LIMIT}
                  rows={value.length > 320 ? 8 : 4}
                  placeholder={t("Write in your own words…", "اكتب بكلماتك…")}
                  onChange={(e) => { setTouched(true); update((s) => ({ ...s, answers: { ...s.answers, [q.key]: e.target.value } })); }}
                />
                {(short || left <= 400) && (
                  <p id={`${id}-foot`} className="question-foot">
                    {short && <span>{t("Add a little more detail so this counts as answered.", "أضف تفصيلاً أكثر لتُحتسب الإجابة.")}</span>}
                    {left <= 400 && <span className={left <= 50 ? "is-warn" : ""}>{t(`${left} characters left`, `متبقٍ ${left} حرفاً`)}</span>}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <div className="section-nav">
          {prev ? <Button variant="ghost" href={`/plan/${prev.id}`} icon={<ArrowLeft size={18} className="flip-rtl" />}>{p(prev.name)}</Button> : <span />}
          {next ? <Button href={`/plan/${next.id}`} trailing={<ArrowRight size={18} />}>{p(next.name)}</Button> : <Button href="/plan/document" trailing={<ArrowRight size={18} />}>{t("Review full plan", "راجع الخطة كاملة")}</Button>}
        </div>
      </div>

      <aside className="plan-rail" aria-label={t("Guidance", "إرشاد")}>
        <section className="rail-block">
          <h2 className="rail-title">{t("For your sector", "لقطاعك")}</h2>
          <p>{p(sector.focus)}</p>
          <p><strong>{t("Field test", "اختبار ميداني")}:</strong> {p(sector.test)}</p>
        </section>
        {meta.forecast && (
          <section className="rail-block">
            <h2 className="rail-title">{t("Check the numbers", "تحقّق من الأرقام")}</h2>
            <p>{t("Test price, cost and demand against your cash.", "اختبر السعر والتكلفة والطلب مقابل نقدك.")}</p>
            <Link className="link" href="/forecast"><ChartLineUp size={16} className="inline-icon" aria-hidden="true" /> {t("Open the forecast", "افتح التوقعات")}</Link>
          </section>
        )}
        {related.length > 0 && (
          <section className="rail-block">
            <h2 className="rail-title">{t("Helpful lessons", "دروس مفيدة")}</h2>
            <ul className="list">
              {related.map((l) => (
                <li key={l.id}>
                  <Link href={`/learn/${l.id}`} className="row row-pad">
                    <span className="row-icon"><BookOpenText size={16} aria-hidden="true" /></span>
                    <span className="row-main"><span className="row-title row-title-wrap">{p(l.title)}</span><span className="row-sub">{state.learning.completed.includes(l.id) ? t("Completed", "مكتمل") : t(`${l.minutes} min`, arMinutes(l.minutes))}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}
