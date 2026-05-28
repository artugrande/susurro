import * as THREE from "three";

export type BlobState = "idle" | "listening" | "speaking";

export interface BlobStateParams {
  intensity: number;
  speed: number;
  displacement: number;
  colorA: THREE.Color;
  colorB: THREE.Color;
  glowColor: THREE.Color;
  glowIntensity: number;
  rotationSpeed: number;
  driftAmount: number;
  pulseRate: number;
}

const c = (hex: string) => new THREE.Color(hex);

// Susurro warm palette: sand (#cbb99d) ↔ warm amber/orange (#f0a868).
export const STATE_PARAMS: Record<BlobState, BlobStateParams> = {
  // Quiet but alive — calm sand, slow boil, soft glow.
  idle: {
    intensity: 0.85,
    speed: 0.3,
    displacement: 0.4,
    colorA: c("#cbb99d"),
    colorB: c("#e8d9bd"),
    glowColor: c("#cbb99d"),
    glowIntensity: 0.5,
    rotationSpeed: 0.05,
    driftAmount: 1.0,
    pulseRate: 0,
  },
  // User is talking, coach listening — gentle warmth, a touch more motion.
  listening: {
    intensity: 0.9,
    speed: 0.6,
    displacement: 0.42,
    colorA: c("#cbb99d"),
    colorB: c("#dcb487"),
    glowColor: c("#e6c89c"),
    glowIntensity: 0.85,
    rotationSpeed: 0.1,
    driftAmount: 1.1,
    pulseRate: 0,
  },
  // Coach speaking — warm amber, a touch livelier than listening but calm
  // (fast motion was distracting). Mostly a color/glow shift, gentle motion.
  speaking: {
    intensity: 0.9,
    speed: 0.7,
    displacement: 0.4,
    colorA: c("#f0a868"),
    colorB: c("#cbb99d"),
    glowColor: c("#f3b274"),
    glowIntensity: 1.05,
    rotationSpeed: 0.08,
    driftAmount: 1.1,
    pulseRate: 0,
  },
};
