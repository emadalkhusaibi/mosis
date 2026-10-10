import clsx from "clsx";

export function ProgressRing({ value, size = 44, stroke = 4, label, className }: { value: number; size?: number; stroke?: number; label?: string; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <svg className={clsx("progress-ring", className)} width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${Math.round(v * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="ring-track" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="ring-value" style={{ "--ring-c": c } as React.CSSProperties} strokeDasharray={c} strokeDashoffset={c * (1 - v)} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}

export function ProgressBar({ value, label, tone = "accent" }: { value: number; label: string; tone?: "accent" | "warning" }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={clsx("bar", `bar-${tone}`)} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)}>
      <span style={{ inlineSize: `${v * 100}%` }} />
    </div>
  );
}
