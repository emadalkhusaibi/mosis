"use client";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

/**
 * The Origin mark drawing itself: the arc sweeps open from the top bar,
 * then the square lands. Geometry is the unchanged brand path, revealed by a mask.
 */
export function AnimatedOrigin({ className = "", delay = 0, title }: { className?: string; delay?: number; title?: string }) {
  const id = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  return (
    <svg className={className} viewBox="0 0 100 100" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <mask id={`arc-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <motion.path
            d="M62 17 L50 17 A33 33 0 1 0 83 50 L83 30"
            fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="butt" strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.15, delay, ease: [0.65, 0, 0.35, 1] }}
          />
        </mask>
      </defs>
      <path mask={`url(#arc-${id})`} fill="currentColor" d="M60 8H48C23 8 8 25 8 50s17 42 42 42 42-17 42-42V34H72v16c0 14-8 22-22 22s-22-8-22-22 8-22 22-22h10Z" />
      <motion.rect
        fill="currentColor" x="72" y="8" width="20" height="20" rx="1.5"
        style={{ transformOrigin: "82px 18px", transformBox: "view-box" }}
        initial={reduce ? false : { scale: 0, rotate: -45, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 18, delay: delay + 0.95 }}
      />
    </svg>
  );
}
