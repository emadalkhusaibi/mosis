"use client";
import Link from "next/link";
import { ArrowRight, Check, Strategy, Users } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { PageHeader, Panel } from "@/components/ui/panel";
import { Money } from "@/components/ui/money";
import { scenarios } from "@/content/scenarios";

export default function PracticePage() {
  const { t, p } = useI18n();
  const { state } = useWorkspace();
  const decided = new Map(state.decisions.map((d) => [d.id, d]));
  const payroll = state.team.reduce((a, m) => a + m.salary, 0);
  return (
    <>
      <PageHeader
        eyebrow={t("CEO practice", "تدريب القيادة")}
        title={t("Rehearse the hard calls.", "تدرّب على القرارات الصعبة.")}
        description={t("Realistic situations scaled to your practice budget. Choose, see the trade-off, and write down what you'd do differently.", "مواقف واقعية بحجم ميزانيتك التدريبية. اختر، وشاهد المقايضة، ودوّن ما ستفعله بشكل مختلف.")}
      />
      <div className="practice-grid">
        {scenarios.map((sc, i) => {
          const d = decided.get(sc.id);
          return (
            <Link key={sc.id} href={`/practice/${sc.id}`} className={clsx("scenario-card panel", d && "is-done")}>
              <div className="chapter-top">
                <span className="chapter-icon"><Strategy size={22} /></span>
                {d ? <span className="chip chip-positive"><Check size={12} weight="bold" />{t("Decided", "تم القرار")}</span> : <span className="chapter-num num">{String(i + 1).padStart(2, "0")}</span>}
              </div>
              <h2 className="chapter-title">{p(sc.title)}</h2>
              <p className="chapter-intro">{p(sc.intro)}</p>
              {d && <p className="small muted">{t("Your choice", "اختيارك")}: <strong className="text-ink">{p(sc.options[d.choice].title)}</strong></p>}
              <ArrowRight size={18} className="chapter-arrow flip-rtl" />
            </Link>
          );
        })}
        <Link href="/practice/team" className="scenario-card panel team-card">
          <div className="chapter-top"><span className="chapter-icon"><Users size={22} /></span></div>
          <h2 className="chapter-title">{t("Your practice team", "فريقك التدريبي")}</h2>
          <p className="chapter-intro">{t("Design roles and feel what payroll does to your monthly costs.", "صمّم الأدوار واشعر بأثر الرواتب على تكاليفك الشهرية.")}</p>
          <p className="small muted">{t(`${state.team.length} roles`, `${state.team.length} أدوار`)} · <Money value={payroll} />{t("/month", "/شهر")}</p>
          <ArrowRight size={18} className="chapter-arrow flip-rtl" />
        </Link>
      </div>
      <Panel className="mt-5"><p className="muted small">{t("Training scenarios. Costs scale with your practice budget; they are not local market quotes.", "مواقف تدريبية. تتناسب التكاليف مع ميزانيتك التدريبية وليست أسعار سوق محلية.")}</p></Panel>
    </>
  );
}
