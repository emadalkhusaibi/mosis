"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, Check, Circle, Printer } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Origin } from "@/components/ui/origin";
import { sectorOf } from "@/content/sectors";
import { readiness, skillNames, type Readiness } from "@/domain/readiness";
import { forecastFor } from "@/domain/forecast";
import { evidenceSummary } from "@/domain/evidence";
import { available } from "@/domain/state";

const noop = () => () => {};

/**
 * The Founder record: one page that shows what a founder has proven, built only
 * from their own work. It lives on this device and is shared by printing it.
 */
export default function FounderRecordPage() {
  const { t, p, date, number } = useI18n();
  const { state } = useWorkspace();
  // Scores depend on today's date (forecast calendar, review weeks), so they render after mount.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const v = state.venture;
  const sector = sectorOf(v.sector);
  const r = readiness(state);
  const ev = evidenceSummary(state);
  const f = forecastFor(state, available(state));
  const tests = state.tests.filter((x) => x.status === "done").slice(0, 6);
  const stage = { starting: t("Starting out", "في البداية"), building: t("Building evidence", "يبني الأدلة"), ready: t("Ready to show", "جاهز للعرض") }[r.stage];

  return (
    <>
      <PageHeader
        title={t("Founder record", "سجلّ المؤسس")}
        description={t("What you've proven so far, built only from your own work. It stays on this device until you print or share it.", "ما أثبتّه حتى الآن، مبنيّ فقط من عملك. يبقى على هذا الجهاز حتى تطبعه أو تشاركه.")}
        action={<Button variant="secondary" icon={<Printer size={18} />} onClick={() => window.print()} className="no-print">{t("Print or save as PDF", "طباعة أو حفظ PDF")}</Button>}
      />

      <div className="grid-12 record">
        <Panel className="col-12 record-head" aria-labelledby="record-name">
          <Origin className="record-mark" />
          <div className="record-id">
            <h2 id="record-name" className="record-name"><bdi>{state.brand?.name || v.name || t("Your business", "مشروعك")}</bdi></h2>
            <p className="secondary"><bdi>{v.founder}</bdi> · {v.sector === "other" ? v.other : p(sector.name)} · <bdi>{v.city}</bdi></p>
            {v.idea && <p className="record-idea"><bdi>{v.idea}</bdi></p>}
          </div>
          <div className="record-overall" aria-live="polite">
            <span className="stat-label">{t("Readiness", "الجاهزية")}</span>
            <span className="record-score num">{mounted ? number(r.overall) : "–"}<small>/100</small></span>
            <span className={clsx("chip", r.stage === "ready" ? "chip-positive" : r.stage === "building" ? "chip-accent" : "")}>{stage}</span>
          </div>
        </Panel>

        <Panel className="col-12 col-lg-7" aria-labelledby="skills-title">
          <PanelHeader id="skills-title" title={t("Six founder skills", "ست مهارات للمؤسس")} subtitle={t("Each point comes from something you did. Open a skill to see what counts.", "كل نقطة تأتي من شيء فعلته. افتح مهارة لترى ما يُحتسب.")} />
          {mounted && <Skills r={r} />}
        </Panel>

        <div className="col-12 col-lg-5 stack">
          <Panel aria-labelledby="next-title">
            <PanelHeader id="next-title" title={t("Biggest step forward", "أكبر خطوة للأمام")} />
            {mounted && r.weakest.next ? (
              <Link href={r.weakest.next.href} className="row row-pad">
                <span className="row-main">
                  <span className="row-title row-title-wrap">{p(r.weakest.next.label)}</span>
                  <span className="row-sub">{p(skillNames[r.weakest.id])} · {t(`+${r.weakest.next.points} points`, `+${r.weakest.next.points} نقطة`)}</span>
                </span>
                <ArrowRight size={16} className="flip-rtl muted" aria-hidden="true" />
              </Link>
            ) : <p className="field-hint">{mounted ? t("Every skill is complete. Time to show this to a mentor.", "اكتملت كل المهارات. حان وقت عرض هذا على مرشد.") : ""}</p>}
          </Panel>

          <Panel aria-labelledby="numbers-title">
            <PanelHeader id="numbers-title" title={t("The numbers", "الأرقام")} subtitle={t("Base scenario, with the market calendar", "السيناريو الأساسي مع التقويم التجاري")} />
            <dl className="balance-list">
              <div><dt>{t("Practice capital", "رأس المال التدريبي")}</dt><dd><Money value={v.capital} /></dd></div>
              <div><dt>{t("Unit margin", "هامش الوحدة")}</dt><dd><Money value={f.unitMargin} /></dd></div>
              <div><dt>{t("Break-even volume", "حجم التعادل")}</dt><dd className="num">{f.breakEven.kind === "units" ? `${number(f.breakEven.units)} ${p(sector.unit)}` : "–"}</dd></div>
              <div><dt>{t("Lowest forecast cash", "أدنى نقد متوقع")}</dt><dd>{mounted ? <Money value={f.lowestCash} tone={f.lowestCash < 0} /> : "–"}</dd></div>
            </dl>
          </Panel>

          <Panel aria-labelledby="habits-title">
            <PanelHeader id="habits-title" title={t("Habits", "العادات")} />
            <dl className="balance-list">
              <div><dt>{t("Field tests recorded", "اختبارات ميدانية مسجلة")}</dt><dd className="num">{ev.done}</dd></div>
              <div><dt>{t("Forecast changes from evidence", "تعديلات التوقعات من الأدلة")}</dt><dd className="num">{ev.revisions}</dd></div>
              <div><dt>{t("Weekly reviews", "المراجعات الأسبوعية")}</dt><dd className="num">{state.reviews.length}</dd></div>
              <div><dt>{t("Practice decisions", "قرارات تدريبية")}</dt><dd className="num">{state.decisions.length}</dd></div>
            </dl>
          </Panel>
        </div>

        <Panel className="col-12" aria-labelledby="evidence-title">
          <PanelHeader id="evidence-title" title={t("Evidence from the field", "أدلة من الميدان")} action={<Link className="link-quiet small no-print" href="/prove/tests">{t("All evidence", "كل الأدلة")}</Link>} />
          {tests.length ? (
            <ul className="list">
              {tests.map((x) => (
                <li key={x.id} className="row evidence-row">
                  <span className="row-main">
                    <span className="row-title row-title-wrap"><bdi>{x.action}</bdi></span>
                    <span className="evidence-finding"><bdi>{x.finding}</bdi>{x.observedAt && <> · {date(x.observedAt)}</>}</span>
                  </span>
                  <span className={clsx("chip", x.outcome === "supports" ? "chip-positive" : x.outcome === "contradicts" ? "chip-danger" : "chip-warning")}>
                    {x.outcome === "supports" ? t("Supports", "يدعم") : x.outcome === "contradicts" ? t("Contradicts", "يعارض") : t("Inconclusive", "غير حاسم")}
                  </span>
                </li>
              ))}
            </ul>
          ) : <p className="field-hint">{t("No field tests yet. A record with real evidence is worth far more to a mentor or lender than a long plan.", "لا اختبارات ميدانية بعد. السجل الذي فيه أدلة حقيقية أثمن عند المرشد أو جهة التمويل من خطة طويلة.")} <Link className="link" href="/prove/tests">{t("Plan one", "خطط لاختبار")}</Link></p>}
        </Panel>
      </div>
    </>
  );
}

function Skills({ r }: { r: Readiness }) {
  const { t, p, number } = useI18n();
  return (
    <ul className="skills">
      {r.skills.map((s) => (
        <li key={s.id}>
          <details className="skill">
            <summary>
              <span className="skill-name">{p(skillNames[s.id])}</span>
              <span className="skill-bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.score} aria-label={p(skillNames[s.id])}><span style={{ inlineSize: `${s.score}%` }} /></span>
              <span className="skill-score num">{number(s.score)}</span>
            </summary>
            <ul className="skill-items">
              {s.items.map((i) => (
                <li key={i.id} className={clsx(i.earned && "is-earned")}>
                  {i.earned ? <Check size={14} weight="bold" aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
                  {i.earned ? <span>{p(i.label)}</span> : <Link className="link" href={i.href}>{p(i.label)}</Link>}
                  <span className="skill-pts num">{i.earned ? t(`${i.points}`, `${i.points}`) : t(`+${i.points}`, `+${i.points}`)}</span>
                  <span className="sr-only">{i.earned ? t("done", "منجز") : t("not yet", "لم يُنجز")}</span>
                </li>
              ))}
            </ul>
          </details>
        </li>
      ))}
    </ul>
  );
}
