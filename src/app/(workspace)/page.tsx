"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpenText, Check, Plus, Trash } from "@phosphor-icons/react";
import clsx from "clsx";
import { arMinutes, useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Button, IconButton } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { categoryMeta } from "@/components/wallet/categories";
import { sectorOf } from "@/content/sectors";
import { sections } from "@/content/sections";
import { lessons } from "@/content/lessons";
import { scenarios } from "@/content/scenarios";
import { available, newId, type State } from "@/domain/state";
import { projection } from "@/domain/forecast";
import { formatCoverage, reserveCoverage } from "@/domain/reserve";
import { nextMove, planProgress } from "@/domain/progress";

type T = (en: string, ar: string) => string;

function greeting(t: T) {
  const h = new Date().getHours();
  if (h < 12) return t("Good morning", "صباح الخير");
  if (h < 17) return t("Good afternoon", "طاب يومك");
  return t("Good evening", "مساء الخير");
}

export default function TodayPage() {
  const { t } = useI18n();
  const { state: s } = useWorkspace();
  const firstName = s.venture.founder.split(/\s+/)[0];

  return (
    <>
      <header className="page-heading today-heading">
        <div className="page-heading-text">
          <p className="page-kicker"><bdi>{s.venture.name}</bdi></p>
          <h1 className="page-title" suppressHydrationWarning>{greeting(t)}{firstName ? <>{t(", ", "، ")}<bdi>{firstName}</bdi></> : ""}</h1>
        </div>
      </header>

      <div className="grid-12 today-grid">
        <NextDecision className="col-12 col-lg-8" />
        <MoneyOverview className="col-12 col-lg-4" />
        <FieldTask className="col-12 col-md-6 col-lg-4" />
        <PlanSummary className="col-12 col-md-6 col-lg-4" />
        <LearnNext className="col-12 col-md-6 col-lg-4" />
        <Recent className="col-12 col-md-6 col-lg-12" s={s} />
      </div>
    </>
  );
}

/** The one recommendation, with the reason it was chosen. */
function NextDecision({ className }: { className?: string }) {
  const { t, p } = useI18n();
  const { state: s } = useWorkspace();
  const move = nextMove(s);
  const plan = planProgress(s);
  const sector = sectorOf(s.venture.sector);

  const copy = (() => {
    switch (move.kind) {
      case "plan": {
        const i = sections.findIndex((x) => x.id === move.sectionId);
        const sec = sections[i];
        const prog = plan.sections[i];
        return {
          title: t(`Write your ${p(sec.name).toLocaleLowerCase()} chapter.`, `اكتب فصل ${p(sec.name)}.`),
          reason: prog.done === 0
            ? t("It's still empty. The numbers you test later lean on what you write here.", "ما زال فارغاً. الأرقام التي ستختبرها لاحقاً تعتمد على ما تكتبه هنا.")
            : t(`${prog.done} of ${prog.total} questions answered so far.`, `أجبت عن ${prog.done} من ${prog.total} أسئلة حتى الآن.`),
          cta: t("Continue writing", "تابع الكتابة"),
        };
      }
      case "forecast":
        return {
          title: t("Put a price and first-month sales on the idea.", "ضع سعراً ومبيعات الشهر الأول للفكرة."),
          reason: t("Without them there's no cash forecast, so you can't see when money might run short.", "بدونها لا توجد توقعات نقدية، فلا يمكنك رؤية متى قد ينقص المال."),
          cta: t("Open forecast", "افتح التوقعات"),
        };
      case "learn": {
        const l = lessons.find((x) => `/learn/${x.id}` === move.href) ?? lessons[0];
        return {
          title: p(l.title),
          reason: t(`A short lesson before your next money decision. About ${l.minutes} minutes.`, `درس قصير قبل قرارك المالي التالي. نحو ${arMinutes(l.minutes)}.`),
          cta: t("Start lesson", "ابدأ الدرس"),
        };
      }
      case "practice": {
        const sc = scenarios.find((x) => `/practice/${x.id}` === move.href) ?? scenarios[0];
        return {
          title: p(sc.title),
          reason: t("Your plan has its foundations. Rehearse a real trade-off with practice money before you face it for real.", "لخطتك أساس الآن. تدرّب على مفاضلة حقيقية بمال تدريبي قبل أن تواجهها فعلاً."),
          cta: t("Make the call", "اتخذ القرار"),
        };
      }
      default:
        return {
          title: t("Review your launch decision.", "راجع قرار الإطلاق."),
          reason: t("The groundwork is done. Decide whether to pilot, revise, research further or pause.", "أنجزت الأساس. قرّر: تجربة أو تعديل أو بحث إضافي أو تريّث."),
          cta: t("Open launch chapter", "افتح فصل الإطلاق"),
        };
    }
  })();

  return (
    <Panel className={clsx("next-decision", className)} aria-labelledby="next-title">
      <p className="page-kicker" id="next-title">{t("Your next decision", "قرارك التالي")}</p>
      <h2 className="next-title">{copy.title}</h2>
      <p className="next-reason">{copy.reason}</p>
      <div className="cluster next-actions">
        <Button href={move.href} size="lg" trailing={<ArrowRight size={18} />}>{copy.cta}</Button>
        <span className="field-hint">{s.venture.sector === "other" ? s.venture.other : p(sector.name)}</span>
      </div>
      <p className="next-note">{t("A suggestion from where you are now, not a fixed rule.", "اقتراح بناءً على موقعك الآن، وليس قاعدة ثابتة.")}</p>
    </Panel>
  );
}

/** Three different numbers, labelled so they can't be confused. */
function MoneyOverview({ className }: { className?: string }) {
  const { t, number } = useI18n();
  const { state: s } = useWorkspace();
  const hasForecast = s.finance.price > 0 && s.finance.units > 0;
  const f = projection(s.finance, available(s));
  return (
    <Panel className={className} aria-labelledby="money-title">
      <PanelHeader id="money-title" title={t("Money", "المال")} action={<Link className="link-quiet small" href="/wallet">{t("Wallet", "المحفظة")}</Link>} />
      <dl className="balance-list">
        <div className="is-strong"><dt>{t("Available to spend", "المتاح للإنفاق")}</dt><dd><Money value={available(s)} /></dd></div>
        <div><dt>{t("Protected reserve", "الاحتياطي المحمي")}<span className="balance-note">{formatCoverage(reserveCoverage(s.reserve, s.finance.fixed), t, number)}</span></dt><dd><Money value={s.reserve} /></dd></div>
        <div>
          <dt>{t("Lowest forecast cash", "أدنى نقد متوقع")}<span className="balance-note">{hasForecast ? (f.lowestMonth === 0 ? t("Right after setup costs", "بعد تكاليف التأسيس") : t(`Month ${f.lowestMonth}, base scenario`, `الشهر ${f.lowestMonth}، السيناريو الأساسي`)) : t("No forecast yet", "لا توجد توقعات بعد")}</span></dt>
          <dd>{hasForecast ? <Money value={f.lowestCash} tone={f.lowestCash < 0} /> : <Link className="link small" href="/forecast">{t("Set up", "إعداد")}</Link>}</dd>
        </div>
      </dl>
    </Panel>
  );
}

/** A real-world step, plus the founder's own action list. */
function FieldTask({ className }: { className?: string }) {
  const { t, p, date } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const suggestion = p(sectorOf(state.venture.sector).test);
  const added = state.tasks.some((x) => x.title === suggestion);
  const open = state.tasks.filter((x) => !x.done);
  const done = state.tasks.filter((x) => x.done).slice(-2);

  const addTask = (text: string, due = "") => update((s) => (s.tasks.some((x) => x.title === text && !x.done) ? s : { ...s, tasks: [...s.tasks, { id: newId(), title: text, due, done: false }] }));
  const remove = (id: string) => {
    const index = state.tasks.findIndex((x) => x.id === id);
    const task = state.tasks[index];
    if (!task || !update((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) }))) return;
    toast({ message: t("Action deleted", "حُذفت المهمة"), action: { label: t("Undo", "تراجع"), run: () => update((s) => ({ ...s, tasks: [...s.tasks.slice(0, index), task, ...s.tasks.slice(index)] })) } });
  };

  return (
    <Panel className={className} aria-labelledby="actions-title">
      <PanelHeader id="actions-title" title={t("Actions", "المهام")} subtitle={t(`${open.length} open`, `${open.length} مفتوحة`)} />
      {!added && (
        <div className="suggestion">
          <p className="suggestion-label">{t("Suggested field test", "اختبار ميداني مقترح")}</p>
          <p className="suggestion-text">{suggestion}</p>
          <Button variant="secondary" size="sm" icon={<Plus size={16} />} onClick={() => addTask(suggestion, new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10))}>{t("Add to my actions", "أضف إلى مهامي")}</Button>
        </div>
      )}
      <ul className="tasks">
        {[...open, ...done].map((task) => (
          <li key={task.id} className={clsx("task", task.done && "is-done")}>
            <input type="checkbox" className="task-check" checked={task.done} aria-label={task.title} onChange={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === task.id ? { ...x, done: !x.done } : x)) }))} />
            <span className="task-main">
              <span className="task-title"><bdi>{task.title}</bdi></span>
              {!task.done && (
                <label className="task-due">
                  <span className="sr-only">{t("Due date for", "تاريخ الاستحقاق لـ")} {task.title}</span>
                  <input type="date" value={task.due} onChange={(e) => update((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === task.id ? { ...x, due: e.target.value } : x)) }))} />
                  {!task.due && <span aria-hidden="true">{t("Add due date", "أضف موعداً")}</span>}
                  {task.due && <span aria-hidden="true">{t("Due", "الموعد")} {date(task.due)}</span>}
                </label>
              )}
            </span>
            <IconButton label={t(`Delete ${task.title}`, `حذف ${task.title}`)} size="sm" onClick={() => remove(task.id)}><Trash size={16} /></IconButton>
          </li>
        ))}
      </ul>
      {state.tasks.length === 0 && added === false && <p className="field-hint">{t("Or add one small step you can do this week.", "أو أضف خطوة صغيرة تستطيع فعلها هذا الأسبوع.")}</p>}
      <form className="task-add" onSubmit={(e) => { e.preventDefault(); if (title.trim()) { addTask(title.trim()); setTitle(""); } }}>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Add an action", "أضف مهمة")} aria-label={t("Add an action", "أضف مهمة")} maxLength={300} />
        <Button type="submit" variant="secondary" size="sm">{t("Add", "إضافة")}</Button>
      </form>
    </Panel>
  );
}

function PlanSummary({ className }: { className?: string }) {
  const { t, p } = useI18n();
  const { state: s } = useWorkspace();
  const plan = planProgress(s);
  const next = plan.sections.findIndex((x) => !x.complete);
  return (
    <Panel className={className} aria-labelledby="plan-title">
      <PanelHeader id="plan-title" title={t("Business plan", "خطة العمل")} subtitle={t(`${plan.done} of ${plan.total} answers`, `${plan.done} من ${plan.total} إجابة`)} action={<Link className="link-quiet small" href="/plan">{t("Overview", "نظرة عامة")}</Link>} />
      <div className="bar" role="progressbar" aria-label={t("Plan progress", "تقدّم الخطة")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(plan.ratio * 100)}><span style={{ inlineSize: `${plan.ratio * 100}%` }} /></div>
      <ol className="chapter-mini">
        {sections.map((sec, i) => (
          <li key={sec.id} className={clsx(plan.sections[i].complete && "is-done", i === next && "is-next")}>
            <Link href={`/plan/${sec.id}`}>
              <span className="chapter-mini-n" aria-hidden="true">{plan.sections[i].complete ? <Check size={12} weight="bold" /> : i + 1}</span>
              <span className="chapter-mini-name">{p(sec.name)}</span>
              <span className="chapter-mini-count">{plan.sections[i].done}/{plan.sections[i].total}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function LearnNext({ className }: { className?: string }) {
  const { t, p } = useI18n();
  const { state: s } = useWorkspace();
  const lesson = lessons.find((l) => !s.learning.completed.includes(l.id));
  return (
    <Panel className={className} aria-labelledby="learn-title">
      <PanelHeader id="learn-title" title={t("Learn", "تعلّم")} subtitle={t(`${s.learning.completed.length} of ${lessons.length} lessons done`, `${s.learning.completed.length} من ${lessons.length} دروس منجزة`)} />
      {lesson ? (
        <Link href={`/learn/${lesson.id}`} className="row row-pad">
          <span className="row-icon"><BookOpenText size={18} aria-hidden="true" /></span>
          <span className="row-main"><span className="row-title row-title-wrap">{p(lesson.title)}</span><span className="row-sub">{t(`${lesson.minutes} min`, arMinutes(lesson.minutes))}</span></span>
          <ArrowRight size={16} className="flip-rtl muted" aria-hidden="true" />
        </Link>
      ) : (
        <p className="field-hint">{t("You've completed every lesson.", "أكملت جميع الدروس.")}</p>
      )}
    </Panel>
  );
}

function Recent({ className, s }: { className?: string; s: State }) {
  const { t, p, date, lang } = useI18n();
  const decisions = [...s.decisions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const entries = s.entries.slice(0, 3);
  return (
    <Panel className={className} aria-labelledby="recent-title">
      <PanelHeader id="recent-title" title={t("Recent", "الأحدث")} />
      <div className="recent-cols">
        <div>
          <h3 className="input-group-title">{t("Decisions", "القرارات")}</h3>
          {decisions.length ? (
            <ul className="list">
              {decisions.map((d) => {
                const sc = scenarios.find((x) => x.id === d.id);
                return (
                  <li key={d.id}><Link href={`/practice/${d.id}`} className="row row-pad"><span className="row-main"><span className="row-title">{sc ? p(sc.title) : d.id}</span><span className="row-sub">{date(d.date)}</span></span>{d.cost ? <Money value={-d.cost} signed /> : null}</Link></li>
                );
              })}
            </ul>
          ) : <p className="field-hint recent-empty">{t("No decisions committed yet.", "لم تعتمد أي قرار بعد.")} <Link className="link" href="/practice">{t("Practice one", "تدرّب على قرار")}</Link></p>}
        </div>
        <div>
          <h3 className="input-group-title">{t("Wallet activity", "حركات المحفظة")}</h3>
          {entries.length ? (
            <ul className="list">
              {entries.map((e) => (
                <li key={e.id} className="row"><span className="row-main"><span className="row-title"><bdi>{e.title}</bdi></span><span className="row-sub">{date(e.date)} · {lang === "ar" ? categoryMeta[e.category].ar : categoryMeta[e.category].en}</span></span><Money value={e.amount} signed tone /></li>
              ))}
            </ul>
          ) : <p className="field-hint recent-empty">{t("No activity yet.", "لا توجد حركات بعد.")}</p>}
        </div>
      </div>
    </Panel>
  );
}
