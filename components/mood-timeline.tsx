"use client";

import type { MyEntry } from "@/lib/read";

const DAY = 86_400_000;

/**
 * A small SVG line/area chart of the user's mood over the last N days.
 * Pure SVG (no chart lib). Inspired by Voice-Journal's EmotionalTimelineChart,
 * adapted to Susurro's palette and data model.
 */
export function MoodTimeline({
  entries,
  days = 14,
}: {
  entries: MyEntry[];
  days?: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: days }, (_, idx) => {
    const i = days - 1 - idx;
    const start = today.getTime() - i * DAY;
    const dayMoods = entries
      .filter(
        (e) =>
          e.type === "mood" &&
          e.mood > 0 &&
          e.created >= start &&
          e.created < start + DAY,
      )
      .map((e) => e.mood);
    const avg = dayMoods.length
      ? dayMoods.reduce((a, b) => a + b, 0) / dayMoods.length
      : null;
    return {
      avg,
      label: new Date(start).toLocaleDateString("es-AR", { weekday: "short" }),
    };
  });

  const hasData = buckets.some((b) => b.avg != null);
  if (!hasData) return null;

  const W = 320;
  const H = 130;
  const padX = 24;
  const padY = 14;
  const chartW = W - padX * 2;
  const chartH = H - padY * 2;

  const coords = buckets.map((b, i) => {
    const x = padX + (i / Math.max(buckets.length - 1, 1)) * chartW;
    const y =
      b.avg != null ? padY + chartH - (b.avg / 10) * chartH : padY + chartH;
    return { ...b, x, y, has: b.avg != null };
  });

  const pts = coords.filter((c) => c.has);
  const line = pts.map((c) => `${c.x},${c.y}`).join(" ");
  const area =
    pts.length > 0
      ? `M ${pts[0].x} ${padY + chartH} ` +
        pts.map((c) => `L ${c.x} ${c.y}`).join(" ") +
        ` L ${pts[pts.length - 1].x} ${padY + chartH} Z`
      : "";

  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Tu ánimo</h3>
        <span className="rounded-full border border-sand/25 px-2.5 py-0.5 text-[0.65rem] text-muted">
          últimos {days} días
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden>
        {[0, 5, 10].map((tick) => {
          const y = padY + chartH - (tick / 10) * chartH;
          return (
            <g key={tick}>
              <line
                x1={padX}
                y1={y}
                x2={W - padX}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              <text x={4} y={y + 3} fill="#8c857a" fontSize="9">
                {tick}
              </text>
            </g>
          );
        })}
        {area && <path d={area} fill="rgba(203,185,157,0.12)" />}
        {line && (
          <polyline
            points={line}
            fill="none"
            stroke="#cbb99d"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {pts.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3" fill="#cbb99d" />
        ))}
      </svg>
    </div>
  );
}
