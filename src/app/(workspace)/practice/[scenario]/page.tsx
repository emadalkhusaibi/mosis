"use client";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useContent } from "@/state/content";
import { useToast } from "@/components/ui/toast";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Field, TextArea } from "@/components/ui/field";
import { sectorOf } from "@/content/sectors";
import { available } from "@/domain/state";
import { commitDecision } from "@/domain/decisions";

export default function ScenarioPage() {
  const { scenario } = useParams<{ scenario: string }>();
  return <Scenario key={scenario} id={scenario} />;
}

function Scenario({ id }: { id: string }) {
  const { scenarios } = useContent();
  const { t, p, date } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const { state, update } = useWorkspace();
  const idx = scenarios.findIndex((s) => s.id === id);
  const record = state.decisions.find((d) => d.id === id);
  const [choice, setChoice] = useState<number | null>(record?.choice ?? null);
  const [reflection, setReflection] = useState(record?.reflection ?? "");
  const [error, setError] = useState<string | null>(null);
  const committing = useRef(false);
  if (idx < 0) notFound();
  const sc = scenarios[idx];
  const next = scenarios.find((s, i) => i > idx && !state.decisions.some((d) => d.id === s.id));
  const sector = sectorOf(state.venture.sector);
  const costOf = (c: number) => Math.round(state.venture.capital * c);
  const now = available(state);
  const previewCost = choice === null ? 0 : record ? 0 : costOf(sc.options[choice].cost);
  const after = now - previewCost;

  const commit = () => {
    if (choice === null || committing.current) return;
    committing.current = true;
    const r = commitDecision(state, { scenarioId: id, choice, options: sc.options.length, reflection, cost: costOf(sc.options[choice].cost), title: p(sc.options[choice].title) });
    if (!r.ok) {
      committing.current = false;
      return setError(r.error === "insufficient_funds" ? t("This option costs more than you can spend. Lower your reserve in the wallet or choose another option.", "هذا الخيار يكلّف أكثر مما يمكنك إنفاقه. خفّض الاحتياطي من المحفظة أو اختر خياراً آخر.") : t("Choose one of the options.", "اختر أحد الخيارات."));
    }
    if (r.state !== state && !update(() => r.state)) {
      committing.current = false;
      return setError(t("That decision couldn't be saved.", "تعذّر حفظ القرار."));
    }
    committing.current = false;
    if (r.replayed) return toast({ message: t("Reflection saved", "تم حفظ التأمل") });
    toast({ message: t("Decision committed", "تم اعتماد القرار") });
    router.push(next ? `/practice/${next.id}` : "/practice");
  };

  return (
    <div className="scenario">
      <nav className="crumbs" aria-label={t("Breadcrumb", "مسار التنقل")}>
        <Link href="/practice" className="link-quiet small"><ArrowLeft size={14} className="flip-rtl inline-icon" aria-hidden="true" /> {t("Practice", "التدريب")}</Link>
      </nav>
      <header className="page-heading">
        <div className="page-heading-text">
          <p className="page-kicker">{record ? t(`Decided ${date(record.date, "long")}`, `حُسم في ${date(record.date, "long")}`) : t(`Scenario ${idx + 1} of ${scenarios.length}`, `الموقف ${idx + 1} من ${scenarios.length}`)}</p>
          <h1 className="page-title">{p(sc.title)}</h1>
          <p className="page-description">{p(sc.intro)}</p>
        </div>
      </header>

      <div className="scenario-layout">
        <div className="scenario-main">
          <dl className="scenario-facts" aria-label={t("Your business facts", "حقائق مشروعك")}>
            <div><dt>{t("Business", "المشروع")}</dt><dd><bdi>{state.venture.name}</bdi> · {p(sector.name)}</dd></div>
            <div><dt>{t("Available to spend", "المتاح للإنفاق")}</dt><dd><Money value={now} /></dd></div>
            <div><dt>{t("Fixed costs", "التكاليف الثابتة")}</dt><dd><Money value={state.finance.fixed} /> {t("a month", "شهرياً")}</dd></div>
          </dl>

          <fieldset className="options">
            <legend className="section-title">{record ? t("Your decision", "قرارك") : t("Choose an option", "اختر خياراً")}</legend>
            <p className="field-hint">{record ? t("Committed decisions keep the option you chose. You can still update your reflection.", "تحتفظ القرارات المعتمدة بالخيار المختار. يمكنك تحديث تأملك.") : t("Selecting only previews the trade-off. Nothing is charged until you commit.", "الاختيار يعرض المفاضلة فقط. لا يُخصم شيء حتى تعتمد القرار.")}</p>
            <div role="radiogroup" aria-label={t("Options", "الخيارات")} className="options-list">
              {sc.options.map((o, i) => {
                const selected = choice === i;
                return (
                  <button key={i} type="button" role="radio" aria-checked={selected} disabled={Boolean(record) && !selected} className={clsx("option", selected && "is-selected")} onClick={() => { if (!record) { setChoice(i); setError(null); } }}>
                    <span className="option-head">
                      <span className="option-radio" aria-hidden="true">{selected && <Check size={12} weight="bold" />}</span>
                      <span className="option-title">{p(o.title)}</span>
                      <span className="option-cost">{o.cost ? <Money value={-costOf(o.cost)} signed /> : t("No cost", "بلا تكلفة")}</span>
                    </span>
                    <span className="option-detail">{p(o.detail)}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="scenario-side">
          <Panel aria-live="polite">
            <PanelHeader level={2} title={t("The trade-off", "المفاضلة")} />
            {choice !== null ? <p className="secondary">{p(sc.options[choice].lesson)}</p> : <p className="field-hint">{t("Choose an option to see what it trades off.", "اختر خياراً لترى ما يقايضه.")}</p>}
            {choice !== null && !record && (
              <dl className="balance-list impact">
                <div><dt>{t("Available now", "المتاح الآن")}</dt><dd><Money value={now} /></dd></div>
                <div><dt>{t("This option", "هذا الخيار")}</dt><dd><Money value={-previewCost} signed /></dd></div>
                <div className="is-strong"><dt>{t("Available after", "المتاح بعده")}</dt><dd><Money value={after} tone={after < 0} /></dd></div>
              </dl>
            )}
          </Panel>
          <Panel>
            <Field label={t("Your reflection", "تأملك")} optional hint={t("What would you watch for? What would change your mind?", "ما الذي ستراقبه؟ وما الذي سيغيّر رأيك؟")}>
              {(f) => <TextArea id={f.id} aria-describedby={f.describedBy} rows={4} maxLength={4000} value={reflection} onChange={(e) => setReflection(e.target.value)} />}
            </Field>
            {error && <p className="notice notice-danger scenario-error" role="alert">{error}</p>}
            <div className="scenario-actions">
              <Button onClick={commit} disabled={choice === null} trailing={!record ? <ArrowRight size={18} /> : undefined}>{record ? t("Save reflection", "حفظ التأمل") : t("Commit decision", "اعتمد القرار")}</Button>
            </div>
            {!record && <p className="field-hint">{t("Committing records one decision and, if the option has a cost, one practice expense in your wallet.", "الاعتماد يسجّل قراراً واحداً، ومصروفاً تدريبياً واحداً في محفظتك إن كان للخيار تكلفة.")}</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
}
