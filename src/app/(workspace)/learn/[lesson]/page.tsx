"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "@phosphor-icons/react";
import clsx from "clsx";
import { arMinutes, useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useContent } from "@/state/content";
import { useToast } from "@/components/ui/toast";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { paths } from "@/content/lessons";
import { level, ranks } from "@/domain/state";

/** Reading time from the lesson text in the current language (≈200 wpm English, ≈160 wpm Arabic). */
function readingMinutes(texts: string[], lang: string) {
  const words = texts.join(" ").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / (lang === "ar" ? 160 : 200)));
}

export default function LessonPage() {
  const { lesson } = useParams<{ lesson: string }>();
  return <Lesson key={lesson} id={lesson} />;
}

function Lesson({ id }: { id: string }) {
  const { lessons } = useContent();
  const { t, p, lang } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const idx = lessons.findIndex((l) => l.id === id);
  const saved = state.learning.answers[id];
  const [choice, setChoice] = useState<number | null>(saved ?? null);
  const [submitted, setSubmitted] = useState(saved !== undefined);
  const [touched, setTouched] = useState(false);
  if (idx < 0) notFound();
  const l = lessons[idx];
  const next = lessons[idx + 1];
  const completed = state.learning.completed.includes(l.id);
  const correct = submitted && choice === l.answer;
  const note = state.learning.notes[l.id] ?? "";
  const read = readingMinutes([...l.body.map(p), p(l.example)], lang);

  const submit = () => {
    if (choice === null) return;
    setSubmitted(true);
    update((s) => ({ ...s, learning: { ...s.learning, answers: { ...s.learning.answers, [l.id]: choice } } }));
  };
  // Completion (and its XP) is recorded once per lesson; repeats change nothing.
  const complete = () => {
    if (completed) return;
    const before = level(state).index;
    const nextState = { ...state, learning: { ...state.learning, completed: [...state.learning.completed, l.id] } };
    if (!update((s) => (s.learning.completed.includes(l.id) ? s : { ...s, learning: { ...s.learning, completed: [...s.learning.completed, l.id] } }))) return;
    const after = level(nextState).index;
    toast({ message: after > before ? t(`New level: ${ranks[after][0]}`, `مستوى جديد: ${ranks[after][1]}`) : t("Lesson complete", "اكتمل الدرس") });
  };

  return (
    <article className="lesson">
      <nav className="crumbs" aria-label={t("Breadcrumb", "مسار التنقل")}>
        <Link href="/learn" className="link-quiet small"><ArrowLeft size={14} className="flip-rtl inline-icon" aria-hidden="true" /> {t("Learn", "تعلّم")}</Link>
      </nav>
      <header className="lesson-head">
        <p className="page-kicker">{p(paths[l.path])} · {t(`Lesson ${idx + 1} of ${lessons.length}`, `الدرس ${idx + 1} من ${lessons.length}`)}</p>
        <h1 className="page-title">{p(l.title)}</h1>
        <p className="field-hint">{t(`About ${read} min to read, plus a short check and exercise.`, `نحو ${arMinutes(read)} للقراءة، مع اختبار وتمرين قصيرين.`)}{completed && <> · <span className="chip chip-positive"><Check size={12} weight="bold" aria-hidden="true" />{t("Completed", "مكتمل")}</span></>}</p>
      </header>

      <div className="lesson-text">{l.body.map((para, i) => <p key={i}>{p(para)}</p>)}</div>

      <aside className="lesson-example" aria-label={t("Example", "مثال")}>
        <p className="suggestion-label">{t("Example", "مثال")}</p>
        <p>{p(l.example)}</p>
      </aside>

      {l.applied && (
        <aside className="lesson-applied" aria-label={t("In your business", "في مشروعك")}>
          <p className="suggestion-label">{t("In your business", "في مشروعك")}</p>
          <p>{p(l.applied)}</p>
        </aside>
      )}

      <Panel className="quiz" aria-labelledby="quiz-title">
        <h2 id="quiz-title" className="section-title">{t("Check your understanding", "تحقق من فهمك")}</h2>
        <fieldset className="quiz-set" disabled={submitted}>
          <legend className="quiz-q">{p(l.question)}</legend>
          {l.options.map((o, i) => {
            const mark = submitted ? (i === l.answer ? "is-correct" : i === choice ? "is-wrong" : "") : "";
            return (
              <label key={i} className={clsx("quiz-option", choice === i && "is-selected", mark)}>
                <input type="radio" name={`quiz-${l.id}`} checked={choice === i} onChange={() => setChoice(i)} />
                <span>{p(o)}</span>
                {submitted && i === l.answer && <Check size={16} weight="bold" className="quiz-icon" aria-label={t("Correct answer", "الإجابة الصحيحة")} />}
                {submitted && i === choice && i !== l.answer && <X size={16} weight="bold" className="quiz-icon" aria-label={t("Your answer", "إجابتك")} />}
              </label>
            );
          })}
        </fieldset>
        {!submitted ? (
          <Button onClick={submit} disabled={choice === null}>{t("Check answer", "تحقق من الإجابة")}</Button>
        ) : (
          <div className={clsx("quiz-feedback", correct ? "is-correct" : "is-wrong")} role="status">
            <p><strong>{correct ? t("That's right.", "إجابة صحيحة.") : t("Not quite.", "ليس تماماً.")}</strong> {p(l.explanation)}</p>
            {!correct && <Button variant="secondary" size="sm" onClick={() => { setSubmitted(false); setChoice(null); }}>{t("Try again", "حاول مجدداً")}</Button>}
          </div>
        )}
      </Panel>

      <section className="lesson-exercise" aria-labelledby="exercise-label">
        <h2 className="section-title">{t("Apply it to your business", "طبّقه على مشروعك")}</h2>
        <label id="exercise-label" htmlFor="exercise" className="secondary">{p(l.exercise)}</label>
        <textarea id="exercise" dir="auto" className="input textarea" rows={5} maxLength={4000} value={note} placeholder={t("Your notes stay in your workspace.", "تبقى ملاحظاتك في مساحة عملك.")}
          onChange={(e) => { setTouched(true); update((s) => ({ ...s, learning: { ...s.learning, notes: { ...s.learning.notes, [l.id]: e.target.value } } })); }} />
        <SaveIndicator touched={touched} />
      </section>

      <div className="section-nav">
        {completed ? <span className="chip chip-positive"><Check size={12} weight="bold" aria-hidden="true" />{t("Lesson complete", "اكتمل الدرس")}</span>
          : <Button onClick={complete} disabled={!correct} icon={<Check size={18} weight="bold" />}>{correct ? t("Mark complete", "إكمال الدرس") : t("Answer the check to complete", "أجب عن الاختبار للإكمال")}</Button>}
        {next && <Button variant="ghost" href={`/learn/${next.id}`} trailing={<ArrowRight size={18} />}>{p(next.title)}</Button>}
      </div>
    </article>
  );
}
