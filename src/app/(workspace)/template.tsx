"use client";
import { motion, useReducedMotion } from "motion/react";

/** Each navigation settles in: a short rise and focus pull, never a slide that hides content. */
export default function WorkspaceTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9, opacity: { duration: 0.28 }, filter: { duration: 0.32 } }}
      className="page-enter"
    >
      {children}
    </motion.div>
  );
}
