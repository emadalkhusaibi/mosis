"use client";
import { useEffect, useRef, useState } from "react";
import { animate as tween } from "motion/react";
import clsx from "clsx";
import { formatRials, type Baisa } from "@/lib/money";
import { useI18n } from "@/lib/i18n";

type Props = { value: Baisa; signed?: boolean; decimals?: "auto" | 0 | 3; compact?: boolean; className?: string; tone?: boolean; animate?: boolean };

/**
 * Renders an amount with the Central Bank of Oman rial sign.
 * With `animate`, the figure counts to its new value like a ledger settling.
 */
export function Money({ value, signed, decimals, compact, className, tone, animate }: Props) {
  const { lang, t } = useI18n();
  const opts = { signed, decimals, compact };
  const text = formatRials(value, lang, opts);
  const [display, setDisplay] = useState<number>(animate ? 0 : value);
  const shown = useRef<number>(animate ? 0 : value);

  useEffect(() => {
    if (!animate) return;
    const from = shown.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controls = tween(from, value, {
      duration: reduce || from === value ? 0 : Math.min(1.1, 0.55 + Math.log10(1 + Math.abs(value - from) / 1000) * 0.15),
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { shown.current = v; setDisplay(v); },
      onComplete: () => { shown.current = value; setDisplay(value); },
    });
    return () => controls.stop();
  }, [animate, value]);

  const visible = animate && display !== value
    ? formatRials(Math.round(display), lang, { signed, compact, decimals: decimals ?? (value % 1000 === 0 ? 0 : 3) })
    : text;

  return (
    <span className={clsx("money num", tone && (value > 0 ? "is-positive" : value < 0 ? "is-negative" : ""), className)} dir="ltr">
      <span className="money-value" aria-hidden={animate ? true : undefined}>{visible}</span>
      {animate && <span className="sr-only">{text}</span>}
      <span className="rial" role="img" aria-label={t("Omani rials", "ريال عُماني")} />
    </span>
  );
}
