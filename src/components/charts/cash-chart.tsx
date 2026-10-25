"use client";
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import type { Month } from "@/domain/forecast";
import { useI18n } from "@/lib/i18n";
import { formatRials } from "@/lib/money";

/** "Nice" tick values covering [min, max], always including zero when it lies in range. */
function ticks(min: number, max: number, count = 4) {
  const span = max - min || Math.abs(max) || 1000;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v));
  return out;
}

/**
 * Cash over twelve months. Values are drawn in an unscaled SVG (text stays
 * crisp) with HTML tick labels. Below-zero cash is shaded differently from
 * positive cash, a dashed line shows the comparison scenario, and arrow keys
 * step through months for keyboard and screen-reader users.
 */
export function CashChart({ months, startCash, height = 240, compact = false, compare, compareLabel }: { months: Month[]; startCash: number; height?: number; compact?: boolean; compare?: Month[]; compareLabel?: string }) {
  const { lang, t } = useI18n();
  const gid = useId().replace(/:/g, "");
  const [active, setActive] = useState<number | null>(null);
  const W = 640, H = height;
  const padL = compact ? 4 : 64, padR = compact ? 4 : 12, padTop = 12, padBottom = compact ? 6 : 28;

  const points = useMemo(() => [startCash, ...months.map((m) => m.cash)], [months, startCash]);
  const comparePoints = compare ? [startCash, ...compare.map((m) => m.cash)] : null;
  const all = [...points, ...(comparePoints ?? []), 0];
  const yTicks = compact ? [Math.min(...all), Math.max(...all)] : ticks(Math.min(...all), Math.max(...all));
  const min = Math.min(...yTicks), max = Math.max(...yTicks);
  const span = max - min || 1;
  const x = (i: number) => padL + (i / (points.length - 1)) * (W - padL - padR);
  const y = (v: number) => padTop + (1 - (v - min) / span) * (H - padTop - padBottom);
  const line = (pts: number[]) => pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const zeroY = y(0);
  const area = `${line(points)} L${x(points.length - 1)},${zeroY} L${x(0)},${zeroY} Z`;
  const short = (v: number) => formatRials(v, lang, { compact: true });

  const lowest = points.reduce((lo, v, i) => (v < points[lo] ? i : lo), 0);
  const summary = t(
    `Projected cash starts at ${formatRials(startCash, "en")} rials, is lowest in ${lowest === 0 ? "the first month" : `month ${lowest}`} at ${formatRials(points[lowest], "en")}, and ends month 12 at ${formatRials(points.at(-1)!, "en")}.`,
    `يبدأ النقد المتوقع عند ${formatRials(startCash, "ar")} ريال، ويكون في أدنى مستوى ${lowest === 0 ? "في البداية" : `في الشهر ${lowest}`} عند ${formatRials(points[lowest], "ar")}، وينتهي في الشهر ١٢ عند ${formatRials(points.at(-1)!, "ar")}.`,
  );

  const onKey = (e: KeyboardEvent) => {
    if (compact) return;
    const last = points.length - 1;
    // The chart is always drawn left-to-right (time), so keys are physical.
    if (e.key === "ArrowRight") setActive((a) => Math.min(last, (a ?? -1) + 1));
    else if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? 1) - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Escape") setActive(null);
    else return;
    e.preventDefault();
  };

  const activeText = active === null ? "" : `${active === 0 ? t("Starting cash", "النقد الأولي") : t(`Month ${active}`, `الشهر ${active}`)}: ${formatRials(points[active], lang)} ${t("rials", "ريال")}`;

  return (
    <figure className={compact ? "cash-chart is-compact" : "cash-chart"}>
      <div className="cash-plot" style={{ blockSize: H }} dir="ltr"
        tabIndex={compact ? undefined : 0} role={compact ? undefined : "group"} aria-label={compact ? undefined : t("Cash chart. Use left and right arrows to read each month.", "مخطط النقد. استخدم الأسهم يميناً ويساراً لقراءة كل شهر.")}
        onKeyDown={onKey} onBlur={() => setActive(null)} onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <clipPath id={`above-${gid}`}><rect x="0" y="0" width={W} height={Math.max(0, zeroY)} /></clipPath>
            <clipPath id={`below-${gid}`}><rect x="0" y={zeroY} width={W} height={Math.max(0, H - zeroY)} /></clipPath>
          </defs>
          {!compact && yTicks.map((v) => <line key={v} x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} className={v === 0 ? "cash-zero" : "cash-grid"} vectorEffect="non-scaling-stroke" />)}
          <path d={area} className="cash-area" clipPath={`url(#above-${gid})`} />
          <path d={area} className="cash-area is-negative" clipPath={`url(#below-${gid})`} />
          {comparePoints && <path d={line(comparePoints)} className="cash-compare" fill="none" vectorEffect="non-scaling-stroke" />}
          <path d={line(points)} className="cash-line" fill="none" vectorEffect="non-scaling-stroke" />
          {!compact && points.map((_, i) => (
            <rect key={i} x={x(i) - (W - padL - padR) / (points.length - 1) / 2} y={0} width={(W - padL - padR) / (points.length - 1)} height={H} fill="transparent" onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} />
          ))}
          {active !== null && <line x1={x(active)} x2={x(active)} y1={padTop} y2={H - padBottom} className="cash-guide" vectorEffect="non-scaling-stroke" />}
        </svg>
        {active !== null && <span className={points[active] < 0 ? "cash-dot is-negative" : "cash-dot"} style={{ left: `${(x(active) / W) * 100}%`, top: y(points[active]) }} />}
        {!compact && (
          <>
            <div className="cash-yaxis">{yTicks.map((v) => <span key={v} style={{ top: y(v) }}>{short(v)}</span>)}</div>
            <div className="cash-xaxis">{points.map((_, i) => <span key={i} style={{ left: `${(x(i) / W) * 100}%` }}>{i === 0 ? t("Now", "الآن") : i}</span>)}</div>
          </>
        )}
        {active !== null && !compact && (
          <div className={active > points.length / 2 ? "cash-tip is-end" : "cash-tip"} style={{ left: `${(x(active) / W) * 100}%` }}>
            <span>{active === 0 ? t("Starting cash", "النقد الأولي") : t(`Month ${active}`, `الشهر ${active}`)}</span>
            <strong>{formatRials(points[active], lang)}</strong>
            {comparePoints && <span>{compareLabel}: {formatRials(comparePoints[active], lang)}</span>}
          </div>
        )}
      </div>
      {!compact && <p className="sr-only" aria-live="polite">{activeText}</p>}
      <figcaption className={compact ? "sr-only" : "cash-caption"}>{summary}</figcaption>
    </figure>
  );
}
