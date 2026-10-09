"use client";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { MotionValue } from "motion/react";

/**
 * The Origin mark as a machined object: the unchanged brand geometry, extruded and
 * bevelled, finished in brushed titanium or graphite, lit by studio light panels
 * (no network fetch for environment maps). It turns toward the pointer, turns with
 * scroll, and the square lands on the ring after the arc settles.
 */

const RING = "M60 8H48C23 8 8 25 8 50s17 42 42 42 42-17 42-42V34H72v16c0 14-8 22-22 22s-22-8-22-22 8-22 22-22h10Z";
const SQUARE = "M73.5 8h17A1.5 1.5 0 0 1 92 9.5v17a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 72 26.5v-17A1.5 1.5 0 0 1 73.5 8Z";

function shapesFrom(d: string) {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${d}"/></svg>`);
  return data.paths.flatMap((p) => p.toShapes());
}

function useGeometry(d: string, depth: number) {
  return useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shapesFrom(d), { depth, bevelEnabled: true, bevelThickness: 2.4, bevelSize: 1.6, bevelSegments: 10, curveSegments: 64 });
    g.translate(-50, -50, -depth / 2);
    g.scale(0.034, -0.034, 0.034); // SVG is y-down; flip and bring to scene units
    g.computeVertexNormals();
    return g;
  }, [d, depth]);
}

type Finish = "titanium" | "titanium-dark";

function Mark({ finish, scroll, reduce }: { finish: Finish; scroll?: MotionValue<number>; reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const square = useRef<THREE.Mesh>(null);
  const ring = useGeometry(RING, 16);
  const cube = useGeometry(SQUARE, 16);
  const born = useRef<number | null>(null);
  const spin = useRef(0);
  const { pointer } = useThree();

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    // Natural titanium; the light-mode variant is a shade deeper so it reads against ice white.
    color: finish === "titanium" ? "#b4bcc4" : "#8a939c",
    metalness: 1,
    roughness: finish === "titanium" ? 0.3 : 0.34,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    envMapIntensity: finish === "titanium" ? 1.2 : 1.35,
  }), [finish]);

  useFrame((state, dt) => {
    const g = group.current;
    const sq = square.current;
    if (!g || !sq) return;
    if (born.current === null) born.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - born.current;
    const s = scroll?.get() ?? 0;

    // Arrival: the ring swings in from a three-quarter view; settles with critically damped easing.
    const intro = reduce ? 1 : 1 - Math.pow(1 - Math.min(1, age / 1.6), 4);
    const targetY = (1 - intro) * -1.4 + pointer.x * 0.45 + s * Math.PI * 1.1 + spin.current;
    const targetX = (1 - intro) * 0.5 - pointer.y * 0.28 + s * 0.25;
    const k = 1 - Math.exp(-dt * 6);
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;

    // The square drops onto its corner after the ring arrives, with a small overshoot.
    const t = reduce ? 1 : Math.min(1, Math.max(0, (age - 1.0) / 0.9));
    const bounce = t === 1 ? 0 : Math.pow(2, -10 * t) * Math.cos(t * Math.PI * 4.5);
    sq.position.y = bounce * 2.4 + (1 - t) * 0.0001;
    sq.position.z = (1 - t) * 0.6;
    sq.rotation.z = (1 - t) * -0.8;
    sq.scale.setScalar(Math.max(0.0001, t < 1 ? Math.min(1, t * 4) : 1));
  });

  return (
    <group ref={group} onClick={() => { spin.current += Math.PI * 2; }} onPointerOver={() => { document.body.style.cursor = "grab"; }} onPointerOut={() => { document.body.style.cursor = ""; }}>
      <mesh geometry={ring} material={material} castShadow />
      <mesh ref={square} geometry={cube} material={material} castShadow />
    </group>
  );
}

/** Frames the mark for the canvas: pulls the camera back on narrow, tall canvases. */
function Rig() {
  useFrame((state) => {
    const aspect = state.size.width / Math.max(1, state.size.height);
    const z = aspect < 0.8 ? 9.5 : aspect < 1.2 ? 7.6 : 6.2;
    if (state.camera.position.z !== z) {
      state.camera.position.z = z;
      state.camera.updateProjectionMatrix();
    }
  });
  return null;
}

function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      {/* A mid-grey cyclorama so flat faces never reflect black, plus a front softbox
          with a darker band, which gives faces the graded sheen of machined metal. */}
      <color attach="background" args={["#5d656e"]} />
      <Lightformer form="rect" intensity={1.6} position={[0, 2.5, 12]} scale={[18, 5, 1]} />
      <Lightformer form="rect" intensity={0.5} position={[0, -3, 12]} scale={[18, 4, 1]} />
      <group rotation={[-Math.PI / 3, 0, 0]}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -9]} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.6, 1]} />
        <Lightformer form="rect" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.4, 1]} />
        <Lightformer form="rect" intensity={1.6} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 1.2, 1]} />
        <Lightformer form="ring" intensity={2.2} position={[2, 2, 6]} scale={3} />
      </group>
    </Environment>
  );
}

export default function OriginScene({ finish = "titanium", scroll, reduce = false, className }: { finish?: Finish; scroll?: MotionValue<number>; reduce?: boolean; className?: string }) {
  return (
    <Canvas
      className={className}
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      frameloop={reduce ? "demand" : "always"}
      aria-hidden="true"
    >
      <Rig />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <Float enabled={!reduce} speed={1.4} rotationIntensity={0.18} floatIntensity={0.35} floatingRange={[-0.06, 0.06]}>
        <Mark finish={finish} scroll={scroll} reduce={reduce} />
      </Float>
      <ContactShadows position={[0, -2.15, 0]} opacity={0.38} scale={9} blur={2.6} far={4} resolution={512} color="#0d0f12" />
      <Studio />
    </Canvas>
  );
}
