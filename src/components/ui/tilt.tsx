"use client";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import clsx from "clsx";

/**
 * A physical card: it leans toward the pointer on springs and a glare moves across
 * its surface like light on anodised metal. Touch devices get the press only.
 */
export function Tilt({ children, className, max = 10, glare = true, style }: { children: ReactNode; className?: string; max?: number; glare?: boolean; style?: React.ComponentProps<typeof motion.div>["style"] }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(90% 70% at ${gx} ${gy}, rgb(255 255 255 / 0.28), rgb(255 255 255 / 0.06) 40%, transparent 70%)`;

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const leave = () => { px.set(0.5); py.set(0.5); };

  return (
    <motion.div className={clsx("tilt", className)} style={{ ...style, rotateX: rx, rotateY: ry, transformPerspective: 900 }} onPointerMove={move} onPointerLeave={leave}>
      {children}
      {glare && <motion.span className="tilt-glare" style={{ background: glareBg }} aria-hidden="true" />}
    </motion.div>
  );
}
