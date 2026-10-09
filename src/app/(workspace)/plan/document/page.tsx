"use client";
import Link from "next/link";
import { ArrowLeft, Printer } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Origin } from "@/components/ui/origin";
import { sections } from "@/content/sections";
import { sectorOf } from "@/content/sectors";
import { projection } from "@/domain/forecast";
import { available } from "@/domain/state";

/** A readable, printable evidence portfolio of the whole plan. */
export default function PlanDocumentPage() {
  const { t, p, date } = useI18n();
  const { state } = useWorkspace();
  const v = state.venture;
  const sector = sectorOf(v.sector);
  const f = projection(state.finance, available(state));
  return (
    <article className="plan-doc">
      <div className="plan-doc-tools no-print">
        <Link href="/plan" className="crumbs-link"><ArrowLeft size={15} className="flip-rtl" />{t("Business plan", "خطة العمل")}</Link>
        <Button variant="secondary" icon={<Printer size={18} />} onClick={() => window.print()}>{t("Print or save as PDF", "طباعة أو حفظ PDF")}</Button>
      </div>
      <header className="plan-doc-head">
        <Origin className="h-9 w-9" />
        <h1 className="page-title">{v.name}</h1>
        <p className="muted">{v.sector === "other" ? v.other : p(sector.name)} · {v.city} · {v.founder}</p>
        {v.idea && <p className="plan-doc-idea">{v.idea}</p>}
        <p className="muted small">{t("Prepared with Moasis on", "أُعدّت باستخدام مؤسس في")} {date(new Date().toISOString(), "long")}</p>
      </header>

      <section className="plan-doc-numbers">
        <div><span className="stat-label">{t("Practice capital", "رأس المال التدريبي")}</span><Money value={v.capital} /></div>
        <div><span className="stat-label">{t("Unit margin", "هامش الوحدة")}</span><Money value={f.unitMargin} /></div>
        <div><span className="stat-label">{t("Break-even", "التعادل")}</span><span>{f.breakEvenUnits ? `${f.breakEvenUnits.toLocaleString()} ${p(sector.unit)}` : "—"}</span></div>
        <div><span className="stat-label">{t("12-month revenue", "إيرادات ١٢ شهراً")}</span><Money value={f.totalRevenue} /></div>
        <div><span className="stat-label">{t("Lowest cash point", "أدنى نقطة نقد")}</span><Money value={f.lowestCash} /></div>
      </section>

      {sections.map((sec, i) => (
        <section key={sec.id} className="plan-doc-section">
          <h2><span className="num">{String(i + 1).padStart(2, "0")}</span> {p(sec.name)}</h2>
          {sec.questions.map((q) => {
            const a = state.answers[q.key]?.trim();
            return (
              <div key={q.key} className="plan-doc-q">
                <h3>{p(q.label)}</h3>
                {a ? <p>{a}</p> : <p className="plan-doc-empty">{t("Not answered yet.", "لم تتم الإجابة بعد.")}</p>}
              </div>
            );
          })}
        </section>
      ))}
      <footer className="plan-doc-foot muted small">
        {t("This plan is a practice document. Figures are assumptions entered by the founder, not verified market data, and it doesn't replace licensing, permits or professional advice.", "هذه الخطة وثيقة تدريبية. الأرقام افتراضات أدخلها المؤسس وليست بيانات سوق موثّقة، ولا تغني عن الترخيص أو التصاريح أو الاستشارة المهنية.")}
      </footer>
    </article>
  );
}
