"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";
import { STATE_PARAMS, type BlobState } from "./states";

// Staggered lerp rates so a state change morphs in layers.
const RATE_COLOR = 1.5;
const RATE_GLOW = 1.2;
const RATE_SHAPE = 1.0;
const RATE_MOTION = 0.6;
const PULSE_DECAY = 1.5;

const CAMERA_Z_DESKTOP = 6.5;
const CAMERA_Z_MOBILE = 5;
const MOBILE_BREAKPOINT = "(max-width: 640px)";

function useCameraZ(): number {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(MOBILE_BREAKPOINT);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile ? CAMERA_Z_MOBILE : CAMERA_Z_DESKTOP;
}

function CameraRig({ z }: { z: number }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.z = z;
    camera.updateProjectionMatrix();
  }, [camera, z]);
  return null;
}

interface BlobProps {
  state: BlobState;
  pulseSeed: number;
}

function Blob({ state, pulseSeed }: BlobProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const targetRef = useRef(STATE_PARAMS.idle);
  const rotationSpeedRef = useRef(STATE_PARAMS.idle.rotationSpeed);
  const driftRef = useRef(STATE_PARAMS.idle.driftAmount);
  const pulseRef = useRef(0);
  const lastSeedRef = useRef(pulseSeed);

  useEffect(() => {
    targetRef.current = STATE_PARAMS[state];
  }, [state]);

  useEffect(() => {
    if (pulseSeed !== lastSeedRef.current) {
      pulseRef.current = Math.max(pulseRef.current, 0.55);
      lastSeedRef.current = pulseSeed;
    }
  }, [pulseSeed]);

  const uniforms = useMemo(() => {
    const seed = STATE_PARAMS.idle;
    return {
      u_time: { value: 0 },
      u_intensity: { value: seed.intensity },
      u_speed: { value: seed.speed },
      u_displacement: { value: seed.displacement },
      u_colorA: { value: seed.colorA.clone() },
      u_colorB: { value: seed.colorB.clone() },
      u_glowColor: { value: seed.glowColor.clone() },
      u_glowIntensity: { value: seed.glowIntensity },
      u_pulse: { value: 0 },
    };
  }, []);

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    const u = mat.uniforms;
    const t = targetRef.current;
    const kColor = Math.min(delta * RATE_COLOR, 1);
    const kGlow = Math.min(delta * RATE_GLOW, 1);
    const kShape = Math.min(delta * RATE_SHAPE, 1);
    const kMotion = Math.min(delta * RATE_MOTION, 1);

    u.u_time.value += delta;
    u.u_intensity.value = THREE.MathUtils.lerp(u.u_intensity.value, t.intensity, kShape);
    u.u_speed.value = THREE.MathUtils.lerp(u.u_speed.value, t.speed, kShape);
    u.u_displacement.value = THREE.MathUtils.lerp(
      u.u_displacement.value,
      t.displacement,
      kShape,
    );
    u.u_glowIntensity.value = THREE.MathUtils.lerp(
      u.u_glowIntensity.value,
      t.glowIntensity,
      kGlow,
    );
    u.u_colorA.value.lerpHSL(t.colorA, kColor);
    u.u_colorB.value.lerpHSL(t.colorB, kColor);
    u.u_glowColor.value.lerpHSL(t.glowColor, kColor);

    pulseRef.current *= Math.exp(-PULSE_DECAY * delta);
    u.u_pulse.value = pulseRef.current;

    rotationSpeedRef.current = THREE.MathUtils.lerp(
      rotationSpeedRef.current,
      t.rotationSpeed,
      kMotion,
    );
    driftRef.current = THREE.MathUtils.lerp(driftRef.current, t.driftAmount, kMotion);

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeedRef.current;
      meshRef.current.rotation.x += delta * rotationSpeedRef.current * 0.4;
      const time = u.u_time.value;
      const d = driftRef.current;
      meshRef.current.position.x = Math.sin(time * 0.13) * 0.05 * d;
      meshRef.current.position.y = Math.cos(time * 0.1) * 0.04 * d;
      meshRef.current.position.z = Math.sin(time * 0.16) * 0.03 * d;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.25, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export default function BlobCanvas({ state, pulseSeed }: BlobProps) {
  const cameraZ = useCameraZ();
  return (
    <Canvas
      camera={{ position: [0, 0, cameraZ], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <CameraRig z={cameraZ} />
      <ambientLight intensity={0.4} />
      <Blob state={state} pulseSeed={pulseSeed} />
    </Canvas>
  );
}
