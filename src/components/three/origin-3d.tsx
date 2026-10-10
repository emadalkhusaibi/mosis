"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";

const Scene = dynamic(() => import("./origin-scene"), { ssr: false });

const noop = () => () => {};
function canRender() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return false;
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The brand sculpture, progressively enhanced:
 * 1. A pre-rendered poster (fixed size, decorative) is always painted first.
 * 2. The 3D scene is imported only when the poster is near the viewport and
 *    motion, data-saving and WebGL allow it.
 * 3. The canvas fades in over the poster after its first complete frame.
 * 4. On context loss the poster simply stays.
 * Rendering pauses offscreen and in hidden tabs.
 */
export function BrandSculpture({ className, size = 260 }: { className?: string; size?: number }) {
  const allowed = useSyncExternalStore(noop, canRender, () => false);
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = box.current;
    if (!el || !allowed) return;
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (e.isIntersecting) setNear(true);
    }, { rootMargin: "200px" });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [allowed]);

  const live = allowed && near && !lost;
  return (
    <div ref={box} className={clsx("sculpture", className)} style={{ "--sculpture-size": `${size}px` } as React.CSSProperties}>
      {/* Both posters ship in the HTML; CSS shows the one for the active theme, so server and client markup match. */}
      {(["light", "dark"] as const).map((v) => (
        <Image key={v} className={clsx("sculpture-poster", `sculpture-poster-${v}`, ready && live && "is-covered")} src={`/images/origin-satin-${v}.webp`} alt="" width={size} height={size} priority={v === "light"} sizes={`${size}px`} />
      ))}
      {live && (
        <Scene
          className={clsx("sculpture-canvas", ready && "is-ready")}
          dark={dark}
          reduce={false}
          active={visible && tabVisible}
          onReady={() => setReady(true)}
          onLost={() => setLost(true)}
        />
      )}
    </div>
  );
}
