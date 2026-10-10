"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * The Origin mark as a small satin-aluminium desk object.
 *
 * - Geometry: the unchanged brand paths, extruded to ~10% of the mark's width
 *   with a soft bevel. Never mirrored for Arabic.
 * - Material: brushed-satin aluminium (metalness 1, roughness ~0.42), lit by an
 *   authored studio (one broad softbox, a weaker fill, a thin rim). No network
 *   fetch, no bloom, no post-processing.
 * - Motion: rests at a near-front three-quarter pose. One settle (≤600ms) after
 *   first paint, then ±4° yaw / ±2° pitch toward a fine pointer. Rendering is
 *   on demand and stops once the pose settles, when offscreen or when hidden.
 */

const RING = "M60 8H48C23 8 8 25 8 50s17 42 42 42 42-17 42-42V34H72v16c0 14-8 22-22 22s-22-8-22-22 8-22 22-22h10Z";
const SQUARE = "M73.5 8h17A1.5 1.5 0 0 1 92 9.5v17a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 72 26.5v-17A1.5 1.5 0 0 1 73.5 8Z";

/** Mark width in SVG units (8 → 92) and the extrusion that keeps depth near 10% of it. */
const MARK_WIDTH = 84;
const DEPTH = 5.6;
const BEVEL = 1.4;
const SCALE = 2 / MARK_WIDTH; // longest side normalised to 2 scene units

const deg = THREE.MathUtils.degToRad;
export const REST_POSE = { pitch: deg(5), yaw: deg(-15) } as const;
const POINTER_YAW = deg(4);
const POINTER_PITCH = deg(2);

function useMarkGeometry() {
  return useMemo(() => {
    const shapes = (d: string) =>
      new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${d}"/></svg>`).paths.flatMap((p) => p.toShapes());
    const opts = { depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL * 0.75, bevelSegments: 8, curveSegments: 48 };
    const ring = new THREE.ExtrudeGeometry(shapes(RING), opts);
    const square = new THREE.ExtrudeGeometry(shapes(SQUARE), opts);
    for (const geo of [ring, square]) {
      geo.translate(-50, -50, -DEPTH / 2);
      geo.scale(SCALE, -SCALE, SCALE); // SVG is y-down
      geo.computeVertexNormals();
    }
    return { ring, square };
  }, []);
}

type Props = { dark: boolean; reduce: boolean; active: boolean; onReady: () => void; onLost: () => void };

function Mark({ dark, reduce, active, onReady }: Omit<Props, "onLost">) {
  const group = useRef<THREE.Group>(null);
  const { ring, square } = useMarkGeometry();
  const { invalidate, gl } = useThree();
  const target = useRef({ pitch: REST_POSE.pitch, yaw: REST_POSE.yaw });
  const ready = useRef(false);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: dark ? "#d3d9dd" : "#c6cdd2",
        metalness: 1,
        roughness: 0.42,
        clearcoat: 0.15,
        clearcoatRoughness: 0.5,
        envMapIntensity: dark ? 1.05 : 1.25,
      }),
    [dark],
  );
  useEffect(() => () => { material.dispose(); }, [material]);
  useEffect(() => () => { ring.dispose(); square.dispose(); }, [ring, square]);

  // Start at the settle origin (or straight at rest when motion is reduced) before the first frame.
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    if (reduce) g.rotation.set(REST_POSE.pitch, REST_POSE.yaw, 0);
    else g.rotation.set(REST_POSE.pitch + deg(3), REST_POSE.yaw - deg(10), 0);
    invalidate();
  }, [reduce, invalidate]);

  // Pointer response: fine pointers only, small angles, no React state per frame.
  useEffect(() => {
    if (reduce || !active || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = gl.domElement.parentElement?.parentElement ?? gl.domElement;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      const y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      target.current = { yaw: REST_POSE.yaw + x * POINTER_YAW, pitch: REST_POSE.pitch + y * POINTER_PITCH };
      invalidate();
    };
    const leave = () => {
      target.current = { pitch: REST_POSE.pitch, yaw: REST_POSE.yaw };
      invalidate();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [reduce, active, gl, invalidate]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    if (!ready.current) {
      ready.current = true;
      // Reveal after the first complete frame.
      requestAnimationFrame(onReady);
    }
    if (!active) return;
    const d = Math.min(dt, 0.05);
    const { pitch, yaw } = target.current;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pitch, 9, d);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, yaw, 9, d);
    const err = Math.max(Math.abs(g.rotation.x - pitch), Math.abs(g.rotation.y - yaw));
    if (err > 0.0005) invalidate();
    else g.rotation.set(pitch, yaw, 0);
  });

  return (
    <group ref={group}>
      <mesh geometry={ring} material={material} />
      <mesh geometry={square} material={material} />
    </group>
  );
}

/** Fits the camera so the whole silhouette sits inside the canvas with ~15% margin, recomputed on resize. */
function Fit() {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const vFov = deg(cam.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (size.width / Math.max(1, size.height)));
    const w = 2.15; // mark width incl. bevel, after the small rest rotation
    const h = 2.15;
    const dist = Math.max(h / (2 * Math.tan(vFov / 2)), w / (2 * Math.tan(hFov / 2))) * 1.34;
    cam.position.set(0, 0.06, dist);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);
  return null;
}

function Studio({ dark }: { dark: boolean }) {
  return (
    <Environment resolution={128} frames={1}>
      <color attach="background" args={[dark ? "#6d767d" : "#9aa3a9"]} />
      {/* Key: one broad softbox, up and to the left, matching the wallet card's highlight. */}
      <Lightformer form="rect" intensity={dark ? 2.2 : 2.6} position={[-3, 4, 6]} rotation={[-0.5, -0.4, 0]} scale={[10, 5, 1]} />
      {/* Fill: weaker and lower, so faces never fall to black. */}
      <Lightformer form="rect" intensity={0.7} position={[4, -2, 5]} scale={[10, 4, 1]} />
      {/* Rim: a thin strip behind, for edge separation. */}
      <Lightformer form="rect" intensity={1.4} position={[0, 2, -6]} scale={[12, 0.6, 1]} />
    </Environment>
  );
}

export default function OriginScene({ dark, reduce, active, onReady, onLost, className }: Props & { className?: string }) {
  return (
    <Canvas
      className={className}
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ fov: 26, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); onLost(); }, { once: true });
      }}
      aria-hidden="true"
    >
      <Fit />
      <Mark dark={dark} reduce={reduce} active={active} onReady={onReady} />
      <ContactShadows position={[0, -1.22, 0]} opacity={dark ? 0.5 : 0.28} scale={4} blur={2.8} far={1.6} resolution={256} frames={1} color="#0d1316" />
      <Studio dark={dark} />
    </Canvas>
  );
}
