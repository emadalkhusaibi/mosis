"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, CaretRight, Certificate, CheckCircle, Notebook, Wallet } from "@phosphor-icons/react";
import clsx from "clsx";
import { arMinutes, useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useContent } from "@/state/content";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { sectorOf } from "@/content/sectors";
import { available } from "@/domain/state";
import { nextMove, planProgress } from "@/domain/progress";
import { evidenceSummary, weekStart } from "@/domain/evidence";
import { dailyFor, localDay } from "@/content/daily";
import { readiness } from "@/domain/readiness";
import { needNames, needOf, nextStep, pathFor, type StepId } from "@/domain/path";

type T = (en: string, ar: string) => string;

function greeting(t: T) {
  const h = new Date().getHours();
  if (h < 12) return t("Good morning", "صباح الخير");
  if (h < 17) return t("Good afternoon", "طاب يومك");
  return t("Good evening", "مساء الخير");
}

function today(lang: string) {
  return new Date().toLocaleDateString(lang === "ar" ? "ar-OM" : "en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export default function TodayPage() {
  const { t, lang } = useI18n();
  const { state: s } = useWorkspace();
  const firstName = s.venture.founder.split(/\s+/)[0];

  return (
    <>
      <header className="page-heading today-heading">
        <div className="page-heading-text">
          <p className="page-kicker" suppressHydrationWarning>{today(lang)}</p>
          <h1 className="page-title large-title" suppressHydrationWarning>{greeting(t)}{firstName ? <>{t(", ", "، ")}<bdi>{firstName}</bdi></> : ""}</h1>
        </div>
      </header>

      <div className="today-stack">
        <NextDecision />
        <YourPath />
        <AtAGlance />
        <DailyDecisionCard />
      </div>
    </>
  );
}

/** The one recommendation, with the reason it was chosen. */
function NextDecision() {
  const { sections, lessons, scenarios } = useContent();
  const { t, p } = useI18n();
  const { state: s } = useWorkspace();
  const plan = planProgress(s);
  const sector = sectorOf(s.venture.sector);
  // The founder's own path leads; once it's walked, the general engine takes over.
  const step = nextStep(s);
  const move = step?.id === "idea" ? { kind: "plan" as const, href: step.href, sectionId: step.sectionId } : step ? { kind: "step" as const, href: step.href } : nextMove(s);
  const stepCta: Record<StepId, string> = {
    idea: t("Continue writing", "تابع الكتابة"),
    numbers: t("Open forecast", "افتح التوقعات"),
    test: t("Plan the test", "خطّط للاختبار"),
    mentor: t("See opportunities", "اعرض الفرص"),
    reserve: t("Open wallet", "افتح المحفظة"),
    practice: t("Make the call", "اتخذ القرار"),
    record: t("Open your record", "افتح سجلّك"),
    launch: t("Open launch steps", "افتح خطوات الانطلاق"),
  };

  const copy = (() => {
    if (move.kind === "step" && step) return { title: p(step.title), reason: p(step.sub), cta: stepCta[step.id] };
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
    <Panel className="next-decision glass-hero" aria-labelledby="next-title">
      <p className="page-kicker" id="next-title">{t("Your next decision", "قرارك التالي")}{step && <> · {p(needNames[needOf(s)])}</>}</p>
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

const noop = () => () => {};

/** Four steps picked for this founder's need and business, with what's done ticked off. */
function YourPath() {
  const { t, p } = useI18n();
  const { state: s } = useWorkspace();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const steps = pathFor(s);
  const current = steps.find((x) => !x.done);
  const done = steps.filter((x) => x.done).length;
  const sectorName = s.venture.sector === "other" ? s.venture.other : p(sectorOf(s.venture.sector).name);
  return (
    <section className="path" aria-labelledby="path-title">
      <div className="path-head">
        <div className="min-w-0">
          <h2 id="path-title" className="path-title">{t("Your path", "مسارك")}</h2>
          <p className="path-sub">{p(needNames[needOf(s)])} · <bdi>{sectorName}</bdi></p>
        </div>
        <Link href="/setup" className="link-quiet small">{t("Change", "غيّر")}</Link>
      </div>
      <ol className="grouped glass path-list">
        {steps.map((x, i) => (
          <li key={x.id}>
            <Link href={x.href} className={clsx("grouped-row path-row", x.done && "is-done", mounted && x === current && "is-current")}>
              <span className="path-mark" aria-hidden="true">{x.done ? <CheckCircle size={26} weight="fill" /> : <span className="path-num">{i + 1}</span>}</span>
              <span className="grouped-main">
                <span className="grouped-title">{p(x.title)}</span>
                <span className="grouped-sub">{p(x.sub)}</span>
              </span>
              <span className="sr-only">{x.done ? t("Done", "منجز") : t("Not done yet", "لم يُنجز بعد")}</span>
              <CaretRight size={16} weight="bold" className="grouped-chevron flip-rtl" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
      <p className="path-foot small muted">{t(`${done} of ${steps.length} done`, `أُنجز ${done} من ${steps.length}`)}</p>
    </section>
  );
}

/** One small decision a day. It moves no money; it builds the habit of weighing trade-offs. */
function DailyDecisionCard() {
  const { t, p } = useI18n();
  const { state, update } = useWorkspace();
  // The day is the founder's local day, which the server can't know, so this renders after mount.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return <Panel className={"daily"} aria-label={t("Today's decision", "قرار اليوم")}><p className="page-kicker">{t("Today's five-minute decision", "قرار اليوم في خمس دقائق")}</p></Panel>;
  const now = new Date();
  const day = localDay(now);
  const d = dailyFor(now);
  const answer = state.daily?.find((x) => x.date === day && x.id === d.id);
  const week = weekStart(now);
  const daysThisWeek = new Set((state.daily ?? []).filter((x) => weekStart(new Date(`${x.date}T12:00:00`)) === week).map((x) => x.date)).size;
  const choose = (choice: number) => update((s) => ({ ...s, daily: [{ date: day, id: d.id, choice }, ...(s.daily ?? []).filter((x) => x.date !== day)].slice(0, 800) }));
  return (
    <Panel className={"daily"} aria-labelledby="daily-title">
      <p className="page-kicker">{t("Today's five-minute decision", "قرار اليوم في خمس دقائق")} · {t(`${daysThisWeek} of 7 days this week`, `${daysThisWeek} من ٧ أيام هذا الأسبوع`)}</p>
      <h2 className="daily-prompt" id="daily-title">{p(d.prompt)}</h2>
      <div role="group" aria-labelledby="daily-title" className="daily-options">
        {d.options.map((o, i) => (
          <button key={i} type="button" aria-pressed={answer?.choice === i} className="choice daily-option" onClick={() => choose(i)}>
            <span className="daily-option-label">{p(o.label)}</span>
            {answer && <span className="daily-weigh">{p(o.weigh)}</span>}
          </button>
        ))}
      </div>
      <p className="field-hint">{answer ? t("Each choice has a cost. There's no score; tomorrow brings a new one.", "لكل خيار ثمن. لا توجد درجات؛ وغداً قرار جديد.") : t("Pick what you'd do. Then see what each choice costs.", "اختر ما ستفعله، ثم شاهد ثمن كل خيار.")}</p>
    </Panel>
  );
}







/** Three numbers worth a glance, each a door to where it lives. */
function AtAGlance() {
  const { t, number } = useI18n();
  const { state: s } = useWorkspace();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const plan = planProgress(s);
  const r = readiness(s);
  const ev = evidenceSummary(s);
  return (
    <section className="glance" aria-label={t("At a glance", "نظرة سريعة")}>
      <Link href="/wallet" className="glance-tile">
        <span className="glance-label"><Wallet size={16} aria-hidden="true" />{t("Available", "المتاح")}</span>
        <span className="glance-value"><Money value={available(s)} /></span>
        <span className="glance-note">{t("Practice money", "مال تدريبي")}</span>
      </Link>
      <Link href="/plan" className="glance-tile">
        <span className="glance-label"><Notebook size={16} aria-hidden="true" />{t("Plan", "الخطة")}</span>
        <span className="glance-value num">{number(Math.round(plan.ratio * 100))}%</span>
        <span className="glance-note">{t(`${plan.done} of ${plan.total} answers`, `${plan.done} من ${plan.total} إجابة`)}</span>
      </Link>
      <Link href="/record" className="glance-tile">
        <span className="glance-label"><Certificate size={16} aria-hidden="true" />{t("Readiness", "الجاهزية")}</span>
        <span className="glance-value num">{mounted ? number(r.overall) : "–"}<small>/100</small></span>
        <span className="glance-note">{!mounted ? "" : ev.reviewedThisWeek ? t("Weekly review done", "أُنجزت المراجعة الأسبوعية") : t(`${ev.done} field tests`, `${ev.done} اختبارات ميدانية`)}</span>
      </Link>
    </section>
  );
}
