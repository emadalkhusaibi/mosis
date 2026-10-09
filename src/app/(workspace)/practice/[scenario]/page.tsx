"use client";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Lightbulb } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { scenarios } from "@/content/scenarios";
import { sectorOf } from "@/content/sectors";
import { available, newId } from "@/domain/state";

export default function ScenarioPage() {
  const { scenario } = useParams<{ scenario: string }>();
  return <Scenario key={scenario} id={scenario} />;
}

function Scenario({ id }: { id: string }) {
  const { t, p } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const { state, update } = useWorkspace();
  const idx = scenarios.findIndex((s) => s.id === id);
  const record = state.decisions.find((d) => d.id === id);
  const [choice, setChoice] = useState<number | null>(record?.choice ?? null);
  const [reflection, setReflection] = useState(record?.reflection ?? "");
  const [error, setError] = useState<string | null>(null);
  if (idx < 0) notFound();
  const sc = scenarios[idx];
  const next = scenarios.find((s, i) => i > idx && !state.decisions.some((d) => d.id === s.id));
  const sector = sectorOf(state.venture.sector);
  const costOf = (c: number) => Math.round(state.venture.capital * c);

  const commit = () => {
    if (choice === null) return;
    const cost = costOf(sc.options[choice].cost);
    if (!record && cost > available(state)) return setError(t("This option costs more than your available funds. Release reserve or choose another option.", "هذا الخيار يكلّف أكثر من أموالك المتاحة. حرّر جزءاً من الاحتياطي أو اختر خياراً آخر."));
    const ok = update((s) => {
      const decisions = [...s.decisions.filter((d) => d.id !== id), { id, choice, reflection: reflection.trim(), date: new Date().toISOString() }];
      // Only the first decision records a cost, so revisiting a scenario never double-charges.
      const entries = !record && cost > 0 ? [{ id: newId(), title: p(sc.options[choice].title), amount: -cost, category: "practice" as const, date: new Date().toISOString() }, ...s.entries] : s.entries;
      return { ...s, decisions, entries };
    });
    if (!ok) return setError(t("That decision couldn't be saved.", "تعذّر حفظ القرار."));
    toast({ message: record ? t("Reflection updated", "تم تحديث التأمل") : t("Decision recorded · +100 XP", "تم تسجيل القرار · +١٠٠ نقطة") });
    if (!record && next) router.push(`/practice/${next.id}`);
    else if (!record) router.push("/practice");
  };

  return (
    <div className="scenario">
      <nav className="crumbs" aria-label={t("Breadcrumb", "مسار التنقل")}>
        <Link href="/practice"><ArrowLeft size={15} className="flip-rtl" />{t("CEO practice", "تدريب القيادة")}</Link>
      </nav>
      <header className="page-header">
        <div className="min-w-0">
          <p className="eyebrow">{state.venture.name} · {p(sector.name)}</p>
          <h1 className="page-title">{p(sc.title)}</h1>
          <p className="page-description">{p(sc.intro)}</p>
        </div>
      </header>

      <div className="scenario-layout">
        <div className="options" role="radiogroup" aria-label={t("Your options", "خياراتك")}>
          {sc.options.map((o, i) => (
            <button key={i} type="button" role="radio" aria-checked={choice === i} disabled={Boolean(record)} className={clsx("option panel", choice === i && "is-selected")} onClick={() => { setChoice(i); setError(null); }}>
              <span className="option-head">
                <span className="option-radio">{choice === i && <Check size={12} weight="bold" />}</span>
                <span className="option-title">{p(o.title)}</span>
                <span className="option-cost">{o.cost ? <Money value={-costOf(o.cost)} /> : t("No cost", "بلا تكلفة")}</span>
              </span>
              <span className="option-detail">{p(o.detail)}</span>
            </button>
          ))}
        </div>

        <div className="scenario-side">
          <AnimatePresence mode="wait">
            {choice !== null ? (
              <motion.div key={choice} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Panel className="consequence">
                  <span className="guide-icon"><Lightbulb size={18} /></span>
                  <h2 className="panel-title text-base">{t("The trade-off", "المقايضة")}</h2>
                  <p>{p(sc.options[choice].lesson)}</p>
                </Panel>
              </motion.div>
            ) : (
              <Panel className="consequence is-empty"><p className="muted">{t("Choose an option to see what it trades off.", "اختر خياراً لترى ما يقايضه.")}</p></Panel>
            )}
          </AnimatePresence>
          <Panel>
            <PanelHeader level={3} title={t("Your reflection", "تأملك")} subtitle={t("What would you watch for? What would change your mind?", "ما الذي ستراقبه؟ وما الذي سيغيّر رأيك؟")} />
            <textarea className="input textarea" rows={4} maxLength={4000} value={reflection} onChange={(e) => setReflection(e.target.value)} aria-label={t("Your reflection", "تأملك")} />
            {error && <p className="field-error mt-2" role="alert">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={commit} disabled={choice === null} trailing={!record ? <ArrowRight size={18} /> : undefined}>{record ? t("Save reflection", "حفظ التأمل") : t("Commit decision", "اعتمد القرار")}</Button>
            </div>
            <p className="muted small mt-3">{t("Committing records the option's cost in your wallet as a practice expense.", "اعتماد القرار يسجّل تكلفة الخيار في محفظتك كمصروف تدريبي.")}</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
