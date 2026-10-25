"use client";
import clsx from "clsx";
import { Origin } from "@/components/ui/origin";
import { Money } from "@/components/ui/money";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { available, level, ranks } from "@/domain/state";
import { formatCoverage, reserveCoverage } from "@/domain/reserve";

export type CardId = "capital" | "reserve" | "pass";
export const cardOrder: CardId[] = ["capital", "reserve", "pass"];

/**
 * The wallet as a stack of cards. With nothing chosen, the cards overlap so each
 * one's top edge (name and balance) shows. Tap a card and it rises to the top
 * while the others tuck into a short stack beneath it. Every figure on a card is
 * also given as text in the lists below, so the cards are never the only source.
 */
export function WalletStack({ selected, onSelect }: { selected: CardId | null; onSelect: (c: CardId | null) => void }) {
  const { t } = useI18n();
  const others = cardOrder.filter((c) => c !== selected);
  return (
    <div className={clsx("wstack", selected ? "is-open" : "is-stacked")} role="group" aria-label={t("Wallet cards", "بطاقات المحفظة")}>
      {cardOrder.map((id, i) => {
        const tucked = selected !== null && id !== selected;
        const style = selected === null
          ? { "--i": i, zIndex: i + 1 }
          : id === selected
            ? { "--i": 0, zIndex: 10 }
            : { "--j": others.indexOf(id), zIndex: 3 - others.indexOf(id) };
        return (
          <button
            key={id}
            type="button"
            className={clsx("wcard", `wcard-${id}`, id === selected && "is-selected", tucked && "is-tucked")}
            style={style as React.CSSProperties}
            aria-pressed={id === selected}
            onClick={() => onSelect(id === selected ? null : id)}
          >
            <CardFace id={id} />
          </button>
        );
      })}
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
        <span className="wcard-top">
          <span className="wcard-brand"><Origin className="wcard-mark" />moasis</span>
          <Money value={available(state)} className="wcard-amount" />
        </span>
        <span className="wcard-mid"><span className="wcard-label">{t("Available to spend", "المتاح للإنفاق")}</span></span>
        <span className="wcard-foot"><bdi className="wcard-holder">{v.founder || t("Founder", "المؤسس")}</bdi><span>{t("Practice money", "مال تدريبي")}</span></span>
      </>
    );
  }
  if (id === "reserve") {
    return (
      <>
        <span className="wcard-top">
          <span className="wcard-brand">{t("Reserve", "الاحتياطي")}</span>
          <Money value={state.reserve} className="wcard-amount" />
        </span>
        <span className="wcard-mid"><span className="wcard-label">{t("Set aside, not spent", "مُخصّص، غير مُنفق")}</span></span>
        <span className="wcard-foot"><span>{formatCoverage(reserveCoverage(state.reserve, state.finance.fixed), t, number)}</span></span>
      </>
    );
  }
  const lv = level(state);
  return (
    <>
      <span className="wcard-top">
        <span className="wcard-brand">{t("Founder pass", "بطاقة المؤسس")}</span>
        <span className="wcard-amount wcard-level">{t("Level", "المستوى")} {lv.index + 1}</span>
      </span>
      <span className="wcard-mid"><span className="wcard-rank">{ranks[lv.index][lang === "ar" ? 1 : 0]}</span></span>
      <span className="wcard-foot wcard-foot-pass">
        <span className="wcard-progress" role="progressbar" aria-label={t("Progress to next level", "التقدّم نحو المستوى التالي")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(lv.progress * 100)}><span style={{ inlineSize: `${lv.progress * 100}%` }} /></span>
        <span className="num">{lv.xp} XP</span>
      </span>
    </>
  );
}
