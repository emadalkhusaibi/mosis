"use client";
import clsx from "clsx";
import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * A radio group drawn as a segmented control, with arrow-key movement that respects direction.
 * The selected segment sits on a glass thumb that slides to each new choice.
 */
export function Segmented<T extends string>({ value, onChange, options, label, size = "sm", className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; label: string; size?: "sm" | "md"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const place = () => {
      const el = root.querySelector<HTMLElement>('[aria-checked="true"]');
      if (!el) return;
      root.style.setProperty("--thumb-x", `${el.offsetLeft}px`);
      root.style.setProperty("--thumb-y", `${el.offsetTop}px`);
      root.style.setProperty("--thumb-w", `${el.offsetWidth}px`);
      root.style.setProperty("--thumb-h", `${el.offsetHeight}px`);
      root.classList.add("has-thumb");
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(root);
    return () => ro.disconnect();
  }, [value, options.length]);
  return (
    <div ref={ref} role="radiogroup" aria-label={label} className={clsx("segmented", `segmented-${size}`, className)}
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
      <span className="segment-thumb" aria-hidden="true" />
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
