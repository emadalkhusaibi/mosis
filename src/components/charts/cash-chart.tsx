"use client";
import { useId, useMemo, useState } from "react";
import type { Month } from "@/domain/forecast";
import { useI18n } from "@/lib/i18n";
import { formatRials } from "@/lib/money";

/** Cash-over-time line with a zero baseline. Hover or focus a month to read its value. */
export function CashChart({ months, startCash, height = 180, compact = false, compare }: { months: Month[]; startCash: number; height?: number; compact?: boolean; compare?: Month[] }) {
  const { lang, t } = useI18n();
  const gid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const W = 600, H = height, padX = compact ? 4 : 36, padTop = 14, padBottom = compact ? 6 : 26;
  const points = useMemo(() => [startCash, ...months.map((m) => m.cash)], [months, startCash]);
  const comparePoints = compare ? [startCash, ...compare.map((m) => m.cash)] : null;
  const all = [...points, ...(comparePoints ?? []), 0];
  const min = Math.min(...all), max = Math.max(...all);
  const span = max - min || 1;
  const x = (i: number) => padX + (i / (points.length - 1)) * (W - padX * 2);
  const y = (v: number) => padTop + (1 - (v - min) / span) * (H - padTop - padBottom);
  const line = (pts: number[]) => pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line(points)} L${x(points.length - 1)},${y(Math.max(min, 0))} L${x(0)},${y(Math.max(min, 0))} Z`;
  const negative = points.some((v) => v < 0);
  const label = t(
    `Projected cash from ${formatRials(startCash, "en")} to ${formatRials(points.at(-1)!, "en")} rials over 12 months`,
    `النقد المتوقع من ${formatRials(startCash, "ar")} إلى ${formatRials(points.at(-1)!, "ar")} ريال خلال ١٢ شهراً`,
  );

  return (
    <div className="cash-chart" style={{ height }} dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {min < 0 && <line x1={padX} x2={W - padX} y1={y(0)} y2={y(0)} className="cash-zero" vectorEffect="non-scaling-stroke" />}
        <path d={area} fill={`url(#fill-${gid})`} className="cash-area" />
        {comparePoints && <path d={line(comparePoints)} className="cash-compare" fill="none" vectorEffect="non-scaling-stroke" />}
        <path d={line(points)} className={negative ? "cash-line is-negative" : "cash-line"} fill="none" vectorEffect="non-scaling-stroke" />
        {!compact && points.map((v, i) => (
          <rect key={i} x={x(i) - (W - padX * 2) / (points.length - 1) / 2} y={0} width={(W - padX * 2) / (points.length - 1)} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={padTop} y2={H - padBottom} className="cash-guide" vectorEffect="non-scaling-stroke" />
            <circle cx={x(hover)} cy={y(points[hover])} r={4} className="cash-dot" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      {!compact && (
        <div className="cash-axis" aria-hidden="true">
          {points.map((_, i) => <span key={i} style={{ insetInlineStart: `${(x(i) / W) * 100}%` }}>{i === 0 ? t("Now", "الآن") : i}</span>)}
        </div>
      )}
      {hover !== null && !compact && (
        <div className="cash-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <span>{hover === 0 ? t("Starting cash", "النقد الأولي") : t(`Month ${hover}`, `الشهر ${hover}`)}</span>
          <strong dir="ltr">{formatRials(points[hover], lang)}</strong>
        </div>
      )}
    </div>
  );
}
