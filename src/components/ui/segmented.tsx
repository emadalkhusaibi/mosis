"use client";
import clsx from "clsx";
import type { ReactNode } from "react";

/** A radio group drawn as a segmented control, with arrow-key movement that respects direction. */
export function Segmented<T extends string>({ value, onChange, options, label, size = "sm", className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; label: string; size?: "sm" | "md"; className?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={clsx("segmented", `segmented-${size}`, className)}
      onKeyDown={(e) => {
        const i = options.findIndex((o) => o.value === value);
        const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
        const fwd = rtl ? "ArrowLeft" : "ArrowRight", back = rtl ? "ArrowRight" : "ArrowLeft";
        const step = e.key === fwd || e.key === "ArrowDown" ? 1 : e.key === back || e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = options[(i + step + options.length) % options.length];
        onChange(next.value);
        (e.currentTarget.querySelector(`[data-value="${next.value}"]`) as HTMLElement | null)?.focus();
      }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={active} tabIndex={active ? 0 : -1} data-value={o.value} className="segment" onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
