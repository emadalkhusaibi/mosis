"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { frame, cancelFrame } from "motion/react";

/** Inertial scrolling for long-form storytelling pages. Disabled under reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true });
    const raf = (data: { timestamp: number }) => lenis.raf(data.timestamp);
    frame.update(raf, true);
    return () => { cancelFrame(raf); lenis.destroy(); };
  }, []);
  return null;
}
