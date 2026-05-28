"use client";

type OrbState = "idle" | "listening" | "speaking";

const SETTINGS: Record<OrbState, { scale: number; dur: string; glow: number; grow: number }> = {
  idle: { scale: 7, dur: "16s", glow: 0.1, grow: 1 },
  listening: { scale: 15, dur: "9s", glow: 0.16, grow: 1.03 },
  speaking: { scale: 30, dur: "4.5s", glow: 0.26, grow: 1.07 },
};

/**
 * An organic, "shader-like" voice blob built with pure SVG (feTurbulence +
 * feDisplacementMap). Wobbles and glows more intensely while speaking. Warm
 * Susurro palette with internal orange patches. No WebGL / heavy deps.
 */
export function VoiceOrb({ state = "idle" }: { state?: OrbState }) {
  const s = SETTINGS[state];
  return (
    <div className="relative h-44 w-44">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle, rgba(203,185,157,${s.glow}), transparent 70%)`,
        }}
      />
      <svg
        viewBox="0 0 200 200"
        className="h-full w-full transition-transform duration-700"
        style={{ transform: `scale(${s.grow})` }}
      >
        <defs>
          <radialGradient id="orbBody" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#ede0c8" />
            <stop offset="55%" stopColor="#cbb99d" />
            <stop offset="100%" stopColor="#9c8463" />
          </radialGradient>
          <radialGradient id="orbWarm" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0a868" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f0a868" stopOpacity="0" />
          </radialGradient>
          <filter id="orbGoo">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012"
              numOctaves="2"
              seed="4"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur={s.dur}
                values="0.010;0.020;0.010"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={s.scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <g filter="url(#orbGoo)">
          <circle cx="100" cy="100" r="60" fill="url(#orbBody)" />
          <circle cx="82" cy="86" r="26" fill="url(#orbWarm)" />
          <circle cx="122" cy="116" r="20" fill="url(#orbWarm)" />
          <circle cx="106" cy="76" r="14" fill="url(#orbWarm)" />
        </g>
      </svg>
    </div>
  );
}
