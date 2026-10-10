"use client";
import { useRef, type KeyboardEvent } from "react";
import { Origin } from "@/components/ui/origin";
import { Money } from "@/components/ui/money";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { available, level, ranks } from "@/domain/state";
import { formatCoverage, reserveCoverage } from "@/domain/reserve";

export type CardId = "capital" | "reserve" | "pass";
export const cardOrder: CardId[] = ["capital", "reserve", "pass"];

/**
 * A compact visual summary of the wallet. Tabs choose the card; the balances
 * themselves are always repeated as text outside it, so the card is never the
 * only way to read them.
 */
export function WalletCards({ active, onChange }: { active: CardId; onChange: (c: CardId) => void }) {
  const { t } = useI18n();
  const tabs = useRef<HTMLDivElement>(null);
  const labels: Record<CardId, string> = {
    capital: t("Available", "المتاح"),
    reserve: t("Reserve", "الاحتياطي"),
    pass: t("Founder pass", "بطاقة المؤسس"),
  };

  const onKey = (e: KeyboardEvent) => {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const fwd = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    const i = cardOrder.indexOf(active);
    let next: number | null = null;
    if (e.key === fwd) next = (i + 1) % cardOrder.length;
    else if (e.key === back) next = (i - 1 + cardOrder.length) % cardOrder.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = cardOrder.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(cardOrder[next]);
    tabs.current?.querySelector<HTMLElement>(`#wallet-tab-${cardOrder[next]}`)?.focus();
  };

  return (
    <div className="wallet-cards">
      <div ref={tabs} className="segmented segmented-sm wallet-card-tabs" role="tablist" aria-label={t("Wallet cards", "بطاقات المحفظة")} onKeyDown={onKey}>
        {cardOrder.map((id) => (
          <button key={id} id={`wallet-tab-${id}`} type="button" role="tab" className="segment" aria-selected={id === active} aria-controls="wallet-card-panel" tabIndex={id === active ? 0 : -1} onClick={() => onChange(id)}>
            {labels[id]}
          </button>
        ))}
      </div>
      <div id="wallet-card-panel" role="tabpanel" aria-labelledby={`wallet-tab-${active}`} className={`wcard wcard-${active}`} key={active}>
        <CardFace id={active} />
      </div>
    </div>
  );
}

function CardFace({ id }: { id: CardId }) {
  const { t, lang, number } = useI18n();
  const { state } = useWorkspace();
  const v = state.venture;
  if (id === "capital") {
    return (
      <>
        <div className="wcard-top"><span className="wcard-brand">moasis</span><Origin className="wcard-mark" /></div>
        <div className="wcard-mid">
          <span className="wcard-label">{t("Available to spend", "المتاح للإنفاق")}</span>
          <Money value={available(state)} className="wcard-amount" />
        </div>
        <div className="wcard-foot"><bdi className="wcard-holder">{v.founder || t("Founder", "المؤسس")}</bdi><span>{t("Simulation", "محاكاة")}</span></div>
      </>
    );
  }
  if (id === "reserve") {
    return (
      <>
        <div className="wcard-top"><span className="wcard-brand">{t("Protected reserve", "الاحتياطي المحمي")}</span><Origin className="wcard-mark" /></div>
        <div className="wcard-mid">
          <span className="wcard-label">{t("Set aside, not spent", "مُخصّص، غير مُنفق")}</span>
          <Money value={state.reserve} className="wcard-amount" />
        </div>
        <div className="wcard-foot"><span>{formatCoverage(reserveCoverage(state.reserve, state.finance.fixed), t, number)}</span></div>
      </>
    );
  }
  const lv = level(state);
  return (
    <>
      <div className="wcard-top"><span className="wcard-brand">{t("Founder pass", "بطاقة المؤسس")}</span><Origin className="wcard-mark" /></div>
      <div className="wcard-mid">
        <span className="wcard-label">{t("Level", "المستوى")} {lv.index + 1}</span>
        <span className="wcard-amount wcard-rank">{ranks[lv.index][lang === "ar" ? 1 : 0]}</span>
      </div>
      <div className="wcard-foot wcard-foot-pass">
        <span className="wcard-progress" role="progressbar" aria-label={t("Progress to next level", "التقدّم نحو المستوى التالي")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lv.progress * 100)}><span style={{ inlineSize: `${lv.progress * 100}%` }} /></span>
        <span className="num">{lv.xp} XP</span>
      </div>
    </>
  );
}
