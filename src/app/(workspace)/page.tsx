"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, BookOpenText, ChartLineUp, Check, Notebook, Plus, Strategy, Trash, Flag } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Button, IconButton } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { ProgressRing } from "@/components/ui/progress";
import { Origin } from "@/components/ui/origin";
import { Tilt } from "@/components/ui/tilt";
import { Morph } from "@/components/ui/morph";
import { Origin3D } from "@/components/three/origin-3d";
import { CashChart } from "@/components/charts/cash-chart";
import { sectorOf } from "@/content/sectors";
import { sections } from "@/content/sections";
import { lessons } from "@/content/lessons";
import { scenarios } from "@/content/scenarios";
import { sectorImage } from "@/content/imagery";
import { available, level, newId, ranks } from "@/domain/state";
import { projection } from "@/domain/forecast";
import { journey, nextMove, planProgress } from "@/domain/progress";

function greeting(t: (en: string, ar: string) => string) {
  const h = new Date().getHours();
  if (h < 5) return t("Working late", "سهر مثمر");
  if (h < 12) return t("Good morning", "صباح الخير");
  if (h < 17) return t("Good afternoon", "طاب يومك");
  return t("Good evening", "مساء الخير");
}

export default function TodayPage() {
  const { t, p, lang } = useI18n();
  const { state: s, update } = useWorkspace();
  const sector = sectorOf(s.venture.sector);
  const plan = planProgress(s);
  const move = nextMove(s);
  const forecast = projection(s.finance, available(s));
  const lv = level(s);
  const stages = journey(s);
  const firstName = s.venture.founder.split(/\s+/)[0];
  const nextLesson = lessons.find((l) => !s.learning.completed.includes(l.id)) ?? lessons[0];

  const moveCopy = {
    plan: (() => {
      const sec = sections.find((x) => x.id === move.sectionId)!;
      return { title: p(sec.name), body: p(sec.intro), cta: t("Continue your plan", "تابع خطتك"), icon: Notebook };
    })(),
    forecast: { title: t("Put numbers to the idea.", "ضع أرقاماً للفكرة."), body: t("Set a price, a unit cost and a first month's sales to see when cash runs out, or doesn't.", "حدّد السعر وتكلفة الوحدة ومبيعات الشهر الأول لترى متى ينفد النقد، أو لا ينفد."), cta: t("Open forecast", "افتح التوقعات"), icon: ChartLineUp },
    learn: { title: p(nextLesson.title), body: t("A short lesson before your next money decision.", "درس قصير قبل قرارك المالي التالي."), cta: t("Start lesson", "ابدأ الدرس"), icon: BookOpenText },
    practice: (() => {
      const sc = scenarios.find((x) => `/practice/${x.id}` === move.href) ?? scenarios[0];
      return { title: p(sc.title), body: p(sc.intro), cta: t("Make the call", "اتخذ القرار"), icon: Strategy };
    })(),
    launch: { title: t("Review your launch decision.", "راجع قرار الإطلاق."), body: t("You've done the groundwork. Decide: pilot, revise, research further or pause.", "أنجزت الأساس. قرّر: تجربة أو تعديل أو بحث إضافي أو تريّث."), cta: t("Open launch plan", "افتح خطة الإطلاق"), icon: Flag },
  }[move.kind];

  const journeyLabels: Record<string, string> = { idea: t("Idea", "الفكرة"), plan: t("Plan", "الخطة"), practice: t("Practice", "التدريب"), launch: t("Launch", "الإطلاق") };

  return (
    <div className="today">
      <header className="today-head">
        <p className="eyebrow">{t("Your founder space", "مساحتك كمؤسس")}</p>
        <h1 className="page-title">{greeting(t)}{firstName ? <>, <em className="accent">{firstName}</em></> : ""}.</h1>
        <p className="page-description">{t("One considered decision at a time.", "قرار مدروس في كل مرة.")}</p>
      </header>

      <section className="hero panel" aria-labelledby="next-move">
        <div className="hero-copy">
          <p className="hero-kicker">{s.venture.name} · {s.venture.sector === "other" ? s.venture.other : p(sector.name)}</p>
          <h2 id="next-move" className="hero-title">{t("Your next move", "خطوتك التالية")}</h2>
          <p className="hero-move-title"><moveCopy.icon size={20} aria-hidden="true" />{moveCopy.title}</p>
          <p className="hero-body">{moveCopy.body}</p>
          <div className="hero-actions">
            <Button href={move.href} size="lg" trailing={<ArrowRight size={18} />}>{moveCopy.cta}</Button>
            <span className="muted small">{t(`${Math.round(plan.ratio * 100)}% of your plan written`, `كُتب ${Math.round(plan.ratio * 100)}٪ من خطتك`)}</span>
          </div>
        </div>
        <div className="hero-art">
          <Image src={sectorImage(s.venture.sector)} alt="" fill sizes="(min-width: 800px) 50vw, 100vw" priority />
          <span className="hero-art-tag">{t("A space to imagine.", "مساحة للتخيّل.")}</span>
        </div>
      </section>

      <ol className="journey" aria-label={t("Your journey", "رحلتك")}>
        {stages.map((st) => (
          <li key={st.id} className={clsx("journey-step", st.value >= 1 && "is-done", st.value > 0 && st.value < 1 && "is-active")}>
            <span className="journey-dot">{st.value >= 1 ? <Check size={12} weight="bold" /> : null}</span>
            <span className="journey-label">{journeyLabels[st.id]}</span>
            <span className="journey-bar"><span style={{ inlineSize: `${Math.min(1, st.value) * 100}%` }} /></span>
          </li>
        ))}
      </ol>

      <div className="grid-dash">
        <Panel className="span-12 md-span-5 tile-wallet">
          <PanelHeader title={t("Practice wallet", "المحفظة التدريبية")} action={<Link className="tile-link" href="/wallet">{t("Open", "فتح")}<ArrowRight size={14} className="flip-rtl" /></Link>} />
          <Morph name="wallet-capital"><Tilt className="mini-card" max={8}>
            <div className="mini-card-top"><span>moasis</span><Origin className="h-5 w-5" /></div>
            <span className="mini-card-label">{t("Available to spend", "المتاح للإنفاق")}</span>
            <Money value={available(s)} className="mini-card-amount" animate />
          </Tilt></Morph>
          <div className="tile-stats">
            <div><span className="stat-label">{t("Reserve", "الاحتياطي")}</span><Money value={s.reserve} className="tile-stat" /></div>
            <div><span className="stat-label">{t("Activity", "الحركات")}</span><span className="tile-stat num">{s.entries.length}</span></div>
          </div>
        </Panel>

        <Panel className="span-12 md-span-7">
          <PanelHeader title={t("Cash runway", "مدى النقد")} subtitle={forecast.firstNegativeMonth ? t(`On current assumptions, cash runs out in month ${forecast.firstNegativeMonth}.`, `وفق الافتراضات الحالية، ينفد النقد في الشهر ${forecast.firstNegativeMonth}.`) : t("On current assumptions, cash stays positive for 12 months.", "وفق الافتراضات الحالية، يبقى النقد موجباً لمدة ١٢ شهراً.")}
            action={<Link className="tile-link" href="/forecast">{t("Forecast", "التوقعات")}<ArrowRight size={14} className="flip-rtl" /></Link>} />
          <CashChart months={forecast.months} startCash={available(s)} height={150} />
          <div className="tile-stats tile-stats-3">
            <div><span className="stat-label">{t("Break-even", "التعادل")}</span><span className="tile-stat">{forecast.breakEvenUnits ? t(`${forecast.breakEvenUnits.toLocaleString()} ${p(sector.unit)}/mo`, `${forecast.breakEvenUnits.toLocaleString()} ${p(sector.unit)}/شهر`) : t("Not yet", "ليس بعد")}</span></div>
            <div><span className="stat-label">{t("Lowest cash", "أدنى نقد")}</span><Money value={forecast.lowestCash} decimals={0} className={clsx("tile-stat", forecast.lowestCash < 0 && "text-caution")} /></div>
            <div><span className="stat-label">{t("Month 12", "الشهر ١٢")}</span><Money value={forecast.endingCash} decimals={0} className="tile-stat" /></div>
          </div>
        </Panel>

        <Panel className="span-12 md-span-4">
          <PanelHeader title={t("Business plan", "خطة العمل")} subtitle={t(`${plan.done} of ${plan.total} answers`, `${plan.done} من ${plan.total} إجابة`)} />
          <div className="plan-mini">
            <ProgressRing value={plan.ratio} size={72} stroke={6} label={t(`${Math.round(plan.ratio * 100)}% complete`, `مكتمل ${Math.round(plan.ratio * 100)}٪`)} />
            <ul className="plan-mini-list">
              {sections.map((sec, i) => (
                <li key={sec.id}>
                  <Link href={`/plan/${sec.id}`} className={clsx(plan.sections[i].complete && "is-done")}>
                    <span className="plan-mini-dot" />{p(sec.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <TasksPanel />

        <Panel className="span-12 md-span-4 tile-level">
          <PanelHeader title={t("Founder level", "مستوى المؤسس")} />
          <div className="level-body">
            <Origin3D className="level-3d" />
            <strong className="level-rank">{ranks[lv.index][lang === "ar" ? 1 : 0]}</strong>
            <span className="muted small num">{lv.xp} XP{lv.next ? t(` · ${lv.toNext} to next level`, ` · ${lv.toNext} للمستوى التالي`) : ""}</span>
          </div>
          <Link href={`/learn/${nextLesson.id}`} className="row tile-row">
            <span className="row-icon"><BookOpenText size={19} /></span>
            <span className="row-main"><span className="row-title">{p(nextLesson.title)}</span><span className="row-sub">{t(`${nextLesson.minutes} min lesson`, `درس ${nextLesson.minutes} دقائق`)}</span></span>
            <ArrowRight size={16} className="flip-rtl muted" />
          </Link>
        </Panel>

        <section className="span-12 field-card panel">
          <div className="field-art"><Image src="/images/fieldwork/coffee-counter.webp" alt="" fill sizes="(min-width: 800px) 40vw, 100vw" /></div>
          <div className="field-copy">
            <p className="eyebrow">{t("Beyond the screen", "خارج الشاشة")}</p>
            <h2 className="panel-title field-title">{t("Make one real-world observation.", "قم بملاحظة واحدة من الواقع.")}</h2>
            <p className="muted">{p(sector.test)}</p>
            <div className="hero-actions">
              <Button variant="secondary" icon={<Plus size={16} />} onClick={() => update((st) => st.tasks.some((x) => x.title === p(sector.test)) ? st : { ...st, tasks: [...st.tasks, { id: newId(), title: p(sector.test), due: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), done: false }] })}>
                {t("Add to my actions", "أضف إلى مهامي")}
              </Button>
              <Button variant="ghost" href="/plan/customer" trailing={<ArrowRight size={16} />}>{t("Record the evidence", "سجّل الدليل")}</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function TasksPanel() {
  const { t, date } = useI18n();
  const { state, update } = useWorkspace();
  const [title, setTitle] = useState("");
  const open = state.tasks.filter((x) => !x.done);
  const done = state.tasks.filter((x) => x.done);
  const add = () => {
    if (!title.trim()) return;
    update((s) => ({ ...s, tasks: [...s.tasks, { id: newId(), title: title.trim(), due: "", done: false }] }));
    setTitle("");
  };
  return (
    <Panel className="span-12 md-span-4">
      <PanelHeader title={t("Your actions", "مهامك")} subtitle={t(`${open.length} open`, `${open.length} مفتوحة`)} />
      <ul className="tasks">
        {[...open, ...done.slice(-3)].map((task) => (
          <li key={task.id} className={clsx("task", task.done && "is-done")}>
            <button type="button" role="checkbox" aria-checked={task.done} className="task-check" onClick={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === task.id ? { ...x, done: !x.done } : x)) }))} aria-label={task.title}>
              {task.done && <Check size={12} weight="bold" />}
            </button>
            <span className="task-title">{task.title}{task.due && <span className="task-due">{date(task.due)}</span>}</span>
            <IconButton label={t("Delete", "حذف")} size="sm" onClick={() => update((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== task.id) }))}><Trash size={15} /></IconButton>
          </li>
        ))}
        {state.tasks.length === 0 && <li className="muted small py-2">{t("Nothing yet. Add one small step you can do this week.", "لا شيء بعد. أضف خطوة صغيرة تستطيع فعلها هذا الأسبوع.")}</li>}
      </ul>
      <form className="task-add" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Add an action", "أضف مهمة")} aria-label={t("Add an action", "أضف مهمة")} maxLength={300} />
        <IconButton type="submit" label={t("Add", "إضافة")} size="sm" variant="glass"><Plus size={15} weight="bold" /></IconButton>
      </form>
    </Panel>
  );
}
