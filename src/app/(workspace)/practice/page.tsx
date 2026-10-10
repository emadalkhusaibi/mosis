"use client";
import Link from "next/link";
import { ArrowRight, Check, Strategy, Users } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { PageHeader, Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { scenarios } from "@/content/scenarios";

export default function PracticePage() {
  const { t, p, date } = useI18n();
  const { state } = useWorkspace();
  const decided = new Map(state.decisions.map((d) => [d.id, d]));
  const open = scenarios.filter((sc) => !decided.has(sc.id));
  const done = scenarios.filter((sc) => decided.has(sc.id));
  const recommended = open[0];
  const payroll = state.team.reduce((a, m) => a + m.salary, 0);

  return (
    <>
      <PageHeader
        title={t("Practice", "التدريب")}
        description={t("Rehearse real trade-offs with practice money. There's rarely one right answer; the point is to see what each choice costs.", "تدرّب على مفاضلات حقيقية بمال تدريبي. نادراً ما توجد إجابة واحدة صحيحة؛ المهم أن ترى كلفة كل خيار.")}
      />

      {recommended ? (
        <Panel className="next-decision practice-recommended" aria-labelledby="rec-title">
          <p className="page-kicker">{t("Recommended next", "المقترح التالي")} · {t(`${done.length} of ${scenarios.length} decided`, `${done.length} من ${scenarios.length} محسومة`)}</p>
          <h2 id="rec-title" className="next-title">{p(recommended.title)}</h2>
          <p className="next-reason">{p(recommended.intro)}</p>
          <div className="cluster next-actions"><Button href={`/practice/${recommended.id}`} trailing={<ArrowRight size={18} />}>{t("Open scenario", "افتح الموقف")}</Button></div>
        </Panel>
      ) : (
        <Panel className="next-decision"><h2 className="next-title">{t("You've worked through every scenario.", "أنهيت جميع المواقف.")}</h2><p className="next-reason">{t("Revisit one to reread its trade-off or update your reflection.", "عُد إلى أحدها لتقرأ المفاضلة أو تحدّث تأملك.")}</p></Panel>
      )}

      <div className="practice-sections">
        {open.length > 1 && (
          <section aria-labelledby="open-title">
            <h2 id="open-title" className="section-title practice-section-title">{t("Still to decide", "بانتظار القرار")}</h2>
            <Panel padded={false}>
              <ul className="chapter-list">
                {open.slice(1).map((sc) => (
                  <li key={sc.id}>
                    <Link href={`/practice/${sc.id}`} className="chapter-row">
                      <span className="chapter-row-icon" aria-hidden="true"><Strategy size={20} /></span>
                      <span className="chapter-row-main"><span className="chapter-row-title">{p(sc.title)}</span><span className="chapter-row-intro">{p(sc.intro)}</span></span>
                      <span className="chapter-row-meta"><span className="chapter-row-count">{t(`${sc.options.length} options`, `${sc.options.length} خيارات`)}</span></span>
                      <ArrowRight size={18} className="flip-rtl chapter-row-arrow" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          </section>
        )}

        {done.length > 0 && (
          <section aria-labelledby="done-title">
            <h2 id="done-title" className="section-title practice-section-title">{t("Decided", "محسومة")}</h2>
            <Panel padded={false}>
              <ul className="chapter-list">
                {done.map((sc) => {
                  const d = decided.get(sc.id)!;
                  return (
                    <li key={sc.id}>
                      <Link href={`/practice/${sc.id}`} className="chapter-row is-done">
                        <span className="chapter-row-icon" aria-hidden="true"><Check size={18} weight="bold" /></span>
                        <span className="chapter-row-main"><span className="chapter-row-title">{p(sc.title)}</span><span className="chapter-row-intro">{t("You chose", "اخترت")}: {p(sc.options[d.choice].title)}</span></span>
                        <span className="chapter-row-meta"><span className="chapter-row-count">{date(d.date)}</span>{d.cost ? <Money value={-d.cost} signed /> : null}</span>
                        <ArrowRight size={18} className="flip-rtl chapter-row-arrow" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </section>
        )}

        <section aria-labelledby="team-title">
          <h2 id="team-title" className="section-title practice-section-title">{t("Team", "الفريق")}</h2>
          <Panel padded={false}>
            <Link href="/practice/team" className="chapter-row">
              <span className="chapter-row-icon" aria-hidden="true"><Users size={20} /></span>
              <span className="chapter-row-main"><span className="chapter-row-title">{t("Practice team", "الفريق التدريبي")}</span><span className="chapter-row-intro">{t("Design roles and see what payroll does to monthly costs.", "صمّم الأدوار وشاهد أثر الرواتب على التكاليف الشهرية.")}</span></span>
              <span className="chapter-row-meta"><span className="chapter-row-count">{t(`${state.team.length} roles`, `${state.team.length} أدوار`)}</span><span><Money value={payroll} /> {t("a month", "شهرياً")}</span></span>
              <ArrowRight size={18} className="flip-rtl chapter-row-arrow" aria-hidden="true" />
            </Link>
          </Panel>
        </section>
      </div>
      <p className="field-hint practice-foot">{t("Training scenarios. Costs scale with your practice capital; they aren't local market quotes.", "مواقف تدريبية. تتناسب التكاليف مع رأس مالك التدريبي وليست أسعار سوق محلية.")}</p>
    </>
  );
}
