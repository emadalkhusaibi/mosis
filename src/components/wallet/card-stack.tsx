"use client";
import { motion, type PanInfo } from "motion/react";
import { useRef, type KeyboardEvent } from "react";
import clsx from "clsx";
import { Origin } from "@/components/ui/origin";
import { Tilt } from "@/components/ui/tilt";
import { Morph } from "@/components/ui/morph";
import { Money } from "@/components/ui/money";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { available, level, ranks } from "@/domain/state";

export type CardId = "capital" | "reserve" | "pass";
export const cardOrder: CardId[] = ["capital", "reserve", "pass"];

/**
 * The signature interaction: three fixed-proportion cards stacked like a wallet.
 * Tap a peeking card, swipe sideways, or use arrow keys to bring one forward.
 */
export function CardStack({ active, onChange, onOpen }: { active: CardId; onChange: (c: CardId) => void; onOpen?: (c: CardId) => void }) {
  const { t, dir } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const idx = cardOrder.indexOf(active);
  const step = (d: number) => onChange(cardOrder[(idx + d + cardOrder.length) % cardOrder.length]);

  const onKey = (e: KeyboardEvent) => {
    const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if (e.key === fwd || e.key === "ArrowDown") { e.preventDefault(); step(1); }
    else if (e.key === back || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    else if ((e.key === "Enter" || e.key === " ") && onOpen) { e.preventDefault(); onOpen(active); }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dx = info.offset.x * (dir === "rtl" ? -1 : 1);
    if (Math.abs(dx) > 60 || Math.abs(info.velocity.x) > 400) step(dx < 0 ? 1 : -1);
  };

  // Cards behind the active one peek above it, in order.
  const behind = [1, 2].map((o) => cardOrder[(idx + o) % cardOrder.length]);

  return (
    <div className="stack-wrap">
      <div
        ref={ref}
        className="stack"
        role="listbox"
        tabIndex={0}
        aria-label={t("Wallet cards. Use arrow keys to switch.", "بطاقات المحفظة. استخدم الأسهم للتبديل.")}
        aria-activedescendant={`card-${active}`}
        onKeyDown={onKey}
      >
        {cardOrder.map((id) => {
          const depth = id === active ? 0 : behind.indexOf(id) + 1;
          return (
            <motion.div
              key={id}
              id={`card-${id}`}
              role="option"
              aria-selected={id === active}
              className={clsx("wcard-slot", depth === 0 && "is-front")}
              style={{ zIndex: 10 - depth }}
              initial={false}
              animate={{ y: depth === 0 ? 0 : -depth * 40, scale: 1 - depth * 0.045, opacity: depth === 2 ? 0.85 : 1 }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              drag={depth === 0 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={onDragEnd}
              whileTap={depth === 0 ? { scale: 0.985 } : undefined}
              onClick={() => (depth === 0 ? onOpen?.(id) : onChange(id))}
            >
              {id === "capital" ? (
                <Morph name="wallet-capital">
                  <Tilt className={clsx("wcard", `wcard-${id}`, depth === 0 && "is-front")} max={depth === 0 ? 9 : 0} glare={depth === 0}><CardFace id={id} /></Tilt>
                </Morph>
              ) : (
                <Tilt className={clsx("wcard", `wcard-${id}`, depth === 0 && "is-front")} max={depth === 0 ? 9 : 0} glare={depth === 0}><CardFace id={id} /></Tilt>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="stack-dots" aria-hidden="true">
        {cardOrder.map((id) => <span key={id} className={clsx(id === active && "is-active")} />)}
      </div>
    </div>
  );
}

function CardFace({ id }: { id: CardId }) {
  const { t, lang } = useI18n();
  const { state } = useWorkspace();
  const v = state.venture;
  if (id === "capital") {
    return (
      <>
        <div className="wcard-top"><span className="wcard-brand">moasis</span><Origin className="wcard-mark" /></div>
        <div className="wcard-mid">
          <span className="wcard-label">{t("Available to spend", "المتاح للإنفاق")}</span>
          <Money value={available(state)} className="wcard-amount" animate />
        </div>
        <div className="wcard-foot"><span className="wcard-holder">{v.founder || t("Founder", "المؤسس")}</span><span>{t("Simulation", "محاكاة")}</span></div>
        <span className="wcard-sheen" aria-hidden="true" />
      </>
    );
  }
  if (id === "reserve") {
    const months = state.finance.fixed > 0 ? state.reserve / state.finance.fixed : 0;
    return (
      <>
        <div className="wcard-top"><span className="wcard-brand">{t("Reserve", "الاحتياطي")}</span><Origin className="wcard-mark" /></div>
        <div className="wcard-mid">
          <span className="wcard-label">{t("Protected for uncertainty", "محمي لمواجهة المجهول")}</span>
          <Money value={state.reserve} className="wcard-amount" animate />
        </div>
        <div className="wcard-foot">
          <span>{state.finance.fixed > 0 ? t(`Covers ${months.toFixed(1)} months of fixed costs`, `يغطي ${months.toFixed(1)} أشهر من التكاليف الثابتة`) : t("Set fixed costs in your forecast", "حدّد التكاليف الثابتة في التوقعات")}</span>
        </div>
        <span className="wcard-sheen" aria-hidden="true" />
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
        <span className="wcard-progress"><span style={{ inlineSize: `${lv.progress * 100}%` }} /></span>
        <span className="num">{lv.xp} XP</span>
      </div>
      <span className="wcard-sheen" aria-hidden="true" />
    </>
  );
}
