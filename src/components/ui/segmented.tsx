"use client";
import { motion } from "motion/react";
import clsx from "clsx";
import { useId, type ReactNode } from "react";

export function Segmented<T extends string>({ value, onChange, options, label, size = "md", className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; label: string; size?: "sm" | "md"; className?: string }) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className={clsx("segmented", `segmented-${size}`, className)}
      onKeyDown={(e) => {
        const i = options.findIndex((o) => o.value === value);
        const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
        const fwd = rtl ? "ArrowLeft" : "ArrowRight", back = rtl ? "ArrowRight" : "ArrowLeft";
        if (e.key !== fwd && e.key !== back) return;
        e.preventDefault();
        const next = options[(i + (e.key === fwd ? 1 : -1) + options.length) % options.length];
        onChange(next.value);
        (e.currentTarget.querySelector(`[data-value="${next.value}"]`) as HTMLElement | null)?.focus();
      }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={active} tabIndex={active ? 0 : -1} data-value={o.value} className={clsx("segment", active && "is-active")} onClick={() => onChange(o.value)}>
            {active && <motion.span layoutId={`seg-${id}`} className="segment-thumb" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="segment-label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
