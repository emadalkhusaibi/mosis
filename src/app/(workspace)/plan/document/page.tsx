"use client";
import Link from "next/link";
import { ArrowLeft, Printer } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useContent } from "@/state/content";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Origin } from "@/components/ui/origin";
import { sectorOf } from "@/content/sectors";
import { forecastFor } from "@/domain/forecast";
import { available } from "@/domain/state";
import { planProgress } from "@/domain/progress";

/** A readable, printable version of the whole plan, built only from saved content. */
export default function PlanDocumentPage() {
  const { sections } = useContent();
  const { t, p, date, number } = useI18n();
  const { state } = useWorkspace();
  const v = state.venture;
  const sector = sectorOf(v.sector);
  const f = forecastFor(state, available(state));
  const prog = planProgress(state);
  const missing = sections.filter((_, i) => !prog.sections[i].complete);
  const breakEven = f.breakEven.kind === "units" ? t(`${number(f.breakEven.units)} ${p(sector.unit)} a month`, `${number(f.breakEven.units)} ${p(sector.unit)} شهرياً`)
    : f.breakEven.kind === "no-margin" ? t("No positive unit margin", "لا يوجد هامش موجب للوحدة") : t("No fixed costs entered", "لم تُدخل تكاليف ثابتة");

  return (
    <article className="plan-print">
      <div className="plan-print-tools no-print">
        <Link href="/plan" className="link-quiet small"><ArrowLeft size={14} className="flip-rtl inline-icon" aria-hidden="true" /> {t("Business plan", "خطة العمل")}</Link>
        <Button variant="secondary" icon={<Printer size={18} />} onClick={() => window.print()}>{t("Print or save as PDF", "طباعة أو حفظ PDF")}</Button>
      </div>

      <header className="plan-print-head">
        <Origin className="plan-print-mark" />
        <h1 className="page-title"><bdi>{v.name}</bdi></h1>
        <p className="secondary">{v.sector === "other" ? v.other : p(sector.name)} · <bdi>{v.city}</bdi> · <bdi>{v.founder}</bdi></p>
        {v.idea && <p className="plan-print-idea"><bdi>{v.idea}</bdi></p>}
        <p className="field-hint" suppressHydrationWarning>{t("Prepared with Moasis on", "أُعدّت باستخدام مؤسس في")} {date(new Date().toISOString(), "long")}</p>
      </header>

      {missing.length > 0 && (
        <p className="notice notice-warning no-print-bg">
          {t(`${prog.done} of ${prog.total} answers written. Still open:`, `كُتبت ${prog.done} من ${prog.total} إجابة. ما زال مفتوحاً:`)} {missing.map((s) => p(s.name)).join(t(", ", "، "))}
        </p>
      )}

      <section className="plan-print-numbers" aria-label={t("Key numbers", "الأرقام الرئيسية")}>
        <h2 className="input-group-title">{t("Key numbers, base scenario", "الأرقام الرئيسية، السيناريو الأساسي")}</h2>
        <dl className="stat-grid">
          <div className="stat"><dt className="stat-label">{t("Practice capital", "رأس المال التدريبي")}</dt><dd className="stat-value"><Money value={v.capital} /></dd></div>
          <div className="stat"><dt className="stat-label">{t("Unit margin", "هامش الوحدة")}</dt><dd className="stat-value"><Money value={f.unitMargin} /></dd></div>
          <div className="stat"><dt className="stat-label">{t("Break-even volume", "حجم التعادل")}</dt><dd className="stat-value">{breakEven}</dd></div>
          <div className="stat"><dt className="stat-label">{t("Lowest forecast cash", "أدنى نقد متوقع")}</dt><dd className="stat-value"><Money value={f.lowestCash} /></dd></div>
          <div className="stat"><dt className="stat-label">{t("Cash at month 12", "النقد في الشهر ١٢")}</dt><dd className="stat-value"><Money value={f.endingCash} /></dd></div>
        </dl>
      </section>

      {sections.map((sec, i) => (
        <section key={sec.id} className="plan-print-section">
          <h2><span className="plan-print-n">{i + 1}</span> {p(sec.name)}</h2>
          {sec.questions.map((q) => {
            const a = state.answers[q.key]?.trim();
            return (
              <div key={q.key} className="plan-print-q">
                <h3>{p(q.label)}</h3>
                {a ? <p dir="auto">{a}</p> : <p className="plan-print-empty">{t("Not answered yet.", "لم تتم الإجابة بعد.")}</p>}
              </div>
            );
          })}
        </section>
      ))}
      <footer className="plan-print-foot field-hint">
        {t("A practice document. Figures are the founder's assumptions, not verified market data, and it doesn't replace licensing, permits or professional advice.", "وثيقة تدريبية. الأرقام افتراضات المؤسس وليست بيانات سوق موثّقة، ولا تغني عن الترخيص أو التصاريح أو الاستشارة المهنية.")}
      </footer>
    </article>
  );
}
