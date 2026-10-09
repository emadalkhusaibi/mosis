"use client";
import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion, type MotionValue } from "motion/react";
import { AnimatedOrigin } from "@/components/ui/origin-animated";

const Scene = dynamic(() => import("./origin-scene"), { ssr: false, loading: () => <Fallback /> });

function Fallback() {
  return <div className="origin-3d-fallback"><AnimatedOrigin className="origin-3d-svg" /></div>;
}

const noop = () => () => {};
function webgl() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** The 3D Origin, loaded on demand. Falls back to the drawn SVG mark without WebGL. */
export function Origin3D({ scroll, className }: { scroll?: MotionValue<number>; className?: string }) {
  const supported = useSyncExternalStore(noop, webgl, () => false);
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion() ?? false;
  return (
    <div className={className}>
      {supported ? <Scene finish={resolvedTheme === "dark" ? "titanium" : "titanium-dark"} scroll={scroll} reduce={reduce} className="origin-3d-canvas" /> : <Fallback />}
    </div>
  );
}
