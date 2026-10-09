"use client";
import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Clock, Lightbulb, X } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { lessons, paths } from "@/content/lessons";
import { pathImages } from "@/content/imagery";
import { level, ranks } from "@/domain/state";

export default function LessonPage() {
  const { lesson } = useParams<{ lesson: string }>();
  return <Lesson key={lesson} id={lesson} />;
}

function Lesson({ id }: { id: string }) {
  const { t, p, lang } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const idx = lessons.findIndex((l) => l.id === id);
  const saved = state.learning.answers[id];
  const [choice, setChoice] = useState<number | null>(saved ?? null);
  const [checked, setChecked] = useState(saved !== undefined);
  if (idx < 0) notFound();
  const l = lessons[idx];
  const next = lessons[idx + 1];
  const completed = state.learning.completed.includes(l.id);
  const correct = choice === l.answer;
  const note = state.learning.notes[l.id] ?? "";

  const check = () => {
    if (choice === null) return;
    setChecked(true);
    update((s) => ({ ...s, learning: { ...s.learning, answers: { ...s.learning.answers, [l.id]: choice } } }));
  };
  const complete = () => {
    const before = level(state).index;
    update((s) => (s.learning.completed.includes(l.id) ? s : { ...s, learning: { ...s.learning, completed: [...s.learning.completed, l.id] } }));
    const after = level({ ...state, learning: { ...state.learning, completed: [...state.learning.completed, l.id] } }).index;
    toast({ message: after > before ? t(`Level up: ${ranks[after][0]}`, `مستوى جديد: ${ranks[after][1]}`) : t("Lesson complete · +100 XP", "اكتمل الدرس · +١٠٠ نقطة") });
  };

  return (
    <article className="lesson">
      <nav className="crumbs" aria-label={t("Breadcrumb", "مسار التنقل")}>
        <Link href="/learn"><ArrowLeft size={15} className="flip-rtl" />{t("Learning studio", "استوديو التعلّم")}</Link>
      </nav>
      <header className="lesson-hero">
        <div className="lesson-hero-art"><Image src={pathImages[l.path]} alt="" fill sizes="(min-width: 900px) 40vw, 100vw" priority /></div>
        <div className="lesson-hero-copy">
          <p className="eyebrow">{p(paths[l.path])}</p>
          <h1 className="page-title">{p(l.title)}</h1>
          <p className="lesson-meta"><Clock size={15} />{t(`${l.minutes} minute read`, `قراءة ${l.minutes} دقائق`)}{completed && <span className="chip chip-positive"><Check size={12} weight="bold" />{t("Completed", "مكتمل")}</span>}</p>
        </div>
      </header>

      <div className="lesson-body">
        <div className="prose-block lesson-prose">{l.body.map((para, i) => <p key={i}>{p(para)}</p>)}</div>

        <Panel className="lesson-example">
          <span className="guide-icon"><Lightbulb size={18} /></span>
          <h2 className="panel-title text-base">{t("Example", "مثال")}</h2>
          <p>{p(l.example)}</p>
        </Panel>

        <Panel className="quiz">
          <h2 className="panel-title">{t("Check your understanding", "تحقق من فهمك")}</h2>
          <p className="quiz-q">{p(l.question)}</p>
          <div className="quiz-options" role="radiogroup" aria-label={p(l.question)}>
            {l.options.map((o, i) => {
              const state = checked ? (i === l.answer ? "is-correct" : i === choice ? "is-wrong" : "") : "";
              return (
                <button key={i} type="button" role="radio" aria-checked={choice === i} disabled={checked} className={clsx("quiz-option", choice === i && "is-selected", state)} onClick={() => setChoice(i)}>
                  <span className="quiz-mark">{checked && i === l.answer ? <Check size={14} weight="bold" /> : checked && i === choice ? <X size={14} weight="bold" /> : (lang === "ar" ? "أبجد" : "ABCD")[i]}</span>
                  <span>{p(o)}</span>
                </button>
              );
            })}
          </div>
          {!checked ? (
            <Button onClick={check} disabled={choice === null}>{t("Check answer", "تحقق من الإجابة")}</Button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={clsx("quiz-feedback", correct ? "is-correct" : "is-wrong")} role="status">
              <strong>{correct ? t("That's right.", "إجابة صحيحة.") : t("Not quite.", "ليس تماماً.")}</strong> {p(l.explanation)}
              {!correct && <button type="button" className="link-btn ms-2" onClick={() => { setChecked(false); setChoice(null); }}>{t("Try again", "حاول مجدداً")}</button>}
            </motion.div>
          )}
        </Panel>

        <Panel>
          <h2 className="panel-title">{t("Apply it to your business", "طبّقه على مشروعك")}</h2>
          <label htmlFor="exercise" className="muted block mt-1 mb-3">{p(l.exercise)}</label>
          <textarea id="exercise" className="input textarea" rows={4} maxLength={4000} value={note} placeholder={t("Your notes stay in your workspace.", "تبقى ملاحظاتك في مساحة عملك.")}
            onChange={(e) => update((s) => ({ ...s, learning: { ...s.learning, notes: { ...s.learning.notes, [l.id]: e.target.value } } }))} />
        </Panel>

        <div className="section-nav">
          {completed ? <span className="chip chip-positive"><Check size={12} weight="bold" />{t("Lesson complete", "اكتمل الدرس")}</span>
            : <Button onClick={complete} disabled={!checked || !correct} icon={<Check size={18} weight="bold" />}>{checked && correct ? t("Mark complete", "إكمال الدرس") : t("Answer correctly to complete", "أجب بشكل صحيح للإكمال")}</Button>}
          {next && <Button variant="ghost" href={`/learn/${next.id}`} trailing={<ArrowRight size={18} />}>{p(next.title)}</Button>}
        </div>
      </div>
    </article>
  );
}
