"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, Certificate, Notebook, Wallet } from "@phosphor-icons/react";
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
    <Panel className="next-decision glass-hero" aria-labelledby="next-title">
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

const noop = () => () => {};

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
