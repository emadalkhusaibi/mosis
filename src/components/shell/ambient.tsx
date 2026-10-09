"use client";
import { useEffect } from "react";

const SPOT = ".chapter, .scenario-card, .lesson-card, .option, .quick-action, .aside-link";

/** Document-level motion helpers: cursor light on cards and the scrolled-chrome state. */
export function Ambient() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => root.classList.toggle("is-scrolled", window.scrollY > 8));
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(SPOT);
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onMove); cancelAnimationFrame(frame); };
  }, []);
  return null;
}
