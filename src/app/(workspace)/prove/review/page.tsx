"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Field, TextArea } from "@/components/ui/field";
import { reviewStreak, reviewThisWeek, saveReview, weekStart } from "@/domain/evidence";

export default function WeeklyReviewPage() {
  const { t, date } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const current = reviewThisWeek(state);
  const [learned, setLearned] = useState(current?.learned ?? "");
  const [changed, setChanged] = useState(current?.changed ?? "");
  const [forecast, setForecast] = useState(current?.forecast ?? "");
  const [next, setNext] = useState(current?.next ?? "");
  const [error, setError] = useState<string | null>(null);

  const week = weekStart();
  const inWeek = (iso?: string) => Boolean(iso) && weekStart(new Date(iso as string)) === week;
  const testsThisWeek = state.tests.filter((x) => inWeek(x.observedAt));
  const decisionsThisWeek = state.decisions.filter((d) => inWeek(d.date));
  const revisionsThisWeek = state.revisions.filter((r) => inWeek(r.date));
  const past = state.reviews.filter((r) => r.id !== current?.id);
  const streak = reviewStreak(state);

  const save = () => {
    if (!learned.trim() && !changed.trim() && !next.trim()) return setError(t("Answer at least one question. A single honest line is enough.", "أجب عن سؤال واحد على الأقل. سطر صادق واحد يكفي."));
    const ok = update((s) => saveReview(s, { learned: learned.trim(), changed: changed.trim(), forecast: forecast.trim(), next: next.trim().slice(0, 600) }));
    if (!ok) return setError(t("That couldn't be saved.", "تعذّر الحفظ."));
    setError(null);
    toast({ message: current ? t("Review updated", "حُدّثت المراجعة") : t("Review saved. See you next week.", "حُفظت المراجعة. نلقاك الأسبوع القادم.") });
  };

  return (
    <>
      <nav className="crumbs" aria-label={t("Breadcrumb", "مسار التنقل")}><Link href="/prove" className="link-quiet small"><ArrowLeft size={14} className="flip-rtl inline-icon" aria-hidden="true" /> {t("Prove", "أثبِت")}</Link></nav>
      <PageHeader
        eyebrow={t(`Week of ${date(week, "long")}`, `أسبوع ${date(week, "long")}`)}
        title={t("Weekly review", "المراجعة الأسبوعية")}
        description={t("Five minutes, once a week. A mentor can read your reviews in two minutes and see how your thinking moved.", "خمس دقائق مرة في الأسبوع. يستطيع المرشد قراءة مراجعاتك في دقيقتين ورؤية كيف تطوّر تفكيرك.")}
      />

      <div className="grid-12">
        <Panel className="col-12 col-lg-8" aria-labelledby="this-week">
          <PanelHeader id="this-week" title={current ? t("This week's review", "مراجعة هذا الأسبوع") : t("This week", "هذا الأسبوع")} subtitle={streak ? t(`${streak} week${streak > 1 ? "s" : ""} in a row`, `${streak} أسبوع متتالٍ`) : undefined} />
          <form className="form-stack" onSubmit={(e) => { e.preventDefault(); save(); }} noValidate>
            <Field label={t("What did you learn?", "ماذا تعلمت؟")} hint={t("From customers, suppliers, a test, or a practice decision.", "من الزبائن أو الموردين أو اختبار أو قرار تدريبي.")}>{(f) => <TextArea id={f.id} aria-describedby={f.describedBy} value={learned} onChange={(e) => setLearned(e.target.value)} maxLength={2000} rows={3} />}</Field>
            <Field label={t("What changed in your plan?", "ما الذي تغيّر في خطتك؟")} hint={t("\"Nothing\" is a fine answer if you say why.", "\"لا شيء\" إجابة مقبولة إن ذكرت السبب.")}>{(f) => <TextArea id={f.id} aria-describedby={f.describedBy} value={changed} onChange={(e) => setChanged(e.target.value)} maxLength={2000} rows={3} />}</Field>
            <Field label={t("Did any number move?", "هل تغيّر أي رقم؟")} optional>{(f) => <TextArea id={f.id} value={forecast} onChange={(e) => setForecast(e.target.value)} maxLength={2000} rows={2} />}</Field>
            <Field label={t("What will you test next week?", "ماذا ستختبر الأسبوع القادم؟")}>{(f) => <TextArea id={f.id} value={next} onChange={(e) => setNext(e.target.value)} maxLength={600} rows={2} />}</Field>
            {error && <p className="notice notice-danger" role="alert">{error}</p>}
            <div className="cluster"><Button type="submit">{current ? t("Update review", "حدّث المراجعة") : t("Save review", "احفظ المراجعة")}</Button></div>
          </form>
        </Panel>

        <Panel className="col-12 col-lg-4" aria-labelledby="week-facts">
          <PanelHeader id="week-facts" title={t("This week in Moasis", "هذا الأسبوع في مؤسس")} />
          <dl className="balance-list">
            <div><dt>{t("Field tests recorded", "اختبارات ميدانية مسجلة")}</dt><dd className="num">{testsThisWeek.length}</dd></div>
            <div><dt>{t("Practice decisions", "قرارات تدريبية")}</dt><dd className="num">{decisionsThisWeek.length}</dd></div>
            <div><dt>{t("Forecast changes from evidence", "تعديلات التوقعات من الأدلة")}</dt><dd className="num">{revisionsThisWeek.length}</dd></div>
          </dl>
          {testsThisWeek.length > 0 && (
            <ul className="list review-facts">
              {testsThisWeek.map((x) => <li key={x.id} className="row"><span className="row-main"><span className="row-title row-title-wrap"><bdi>{x.action}</bdi></span><span className="row-sub"><bdi>{x.finding}</bdi></span></span></li>)}
            </ul>
          )}
        </Panel>

        {past.length > 0 && (
          <Panel className="col-12" aria-labelledby="past-reviews">
            <PanelHeader id="past-reviews" title={t("Earlier weeks", "الأسابيع السابقة")} subtitle={t(`${past.length} reviews`, `${past.length} مراجعة`)} />
            <ol className="review-timeline">
              {past.map((r) => (
                <li key={r.id}>
                  <p className="review-date">{t(`Week of ${date(weekStart(new Date(r.date)), "long")}`, `أسبوع ${date(weekStart(new Date(r.date)), "long")}`)}</p>
                  <dl className="definition-list">
                    {r.learned && <><dt>{t("Learned", "تعلّمت")}</dt><dd><bdi>{r.learned}</bdi></dd></>}
                    {r.changed && <><dt>{t("Changed", "تغيّر")}</dt><dd><bdi>{r.changed}</bdi></dd></>}
                    {r.forecast && <><dt>{t("Numbers", "الأرقام")}</dt><dd><bdi>{r.forecast}</bdi></dd></>}
                    {r.next && <><dt>{t("Next", "التالي")}</dt><dd><bdi>{r.next}</bdi></dd></>}
                  </dl>
                </li>
              ))}
            </ol>
          </Panel>
        )}
      </div>
    </>
  );
}
