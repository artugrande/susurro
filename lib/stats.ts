import type { MyEntry } from "@/lib/read";

const DAY = 86_400_000;

function dayKey(ms: number): string {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export interface Stats {
  streak: number;
  total: number;
  todayDone: boolean;
}

/** Consecutive-day check-in streak, total entries, and whether today is done. */
export function computeStats(entries: MyEntry[]): Stats {
  const days = new Set(entries.map((e) => dayKey(e.created)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDone = days.has(dayKey(today.getTime()));

  let streak = 0;
  // Start from today if done, else from yesterday (so a missed today doesn't
  // immediately break a streak mid-day).
  let cursor = todayDone ? today.getTime() : today.getTime() - DAY;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor -= DAY;
  }

  return { streak, total: entries.length, todayDone };
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface Threads {
  worries: TagCount[];
  brights: TagCount[];
}

/** Split tags into "worries" (from low-mood entries) and "brights" (high-mood). */
export function computeThreads(entries: MyEntry[]): Threads {
  const worry = new Map<string, number>();
  const bright = new Map<string, number>();

  for (const e of entries) {
    if (!e.tags?.length || !e.mood) continue;
    const bucket = e.mood <= 4 ? worry : e.mood >= 7 ? bright : null;
    if (!bucket) continue;
    for (const raw of e.tags) {
      const tag = raw.trim().toLowerCase();
      if (!tag) continue;
      bucket.set(tag, (bucket.get(tag) ?? 0) + 1);
    }
  }

  const toSorted = (m: Map<string, number>): TagCount[] =>
    [...m.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

  return { worries: toSorted(worry), brights: toSorted(bright) };
}

export interface WeeklyRecap {
  hasData: boolean;
  text: string;
}

/** Build a warm, data-driven Spanish recap of the last 7 days (no LLM). */
export function buildWeeklyRecap(entries: MyEntry[]): WeeklyRecap {
  const since = Date.now() - 7 * DAY;
  const week = entries
    .filter((e) => e.created >= since)
    .sort((a, b) => a.created - b.created);

  if (week.length === 0) {
    return {
      hasData: false,
      text: "Todavía no hay registros esta semana. Hacé un check-in conmigo y te armo tu resumen.",
    };
  }

  const moods = week.filter((e) => e.mood > 0).map((e) => e.mood);
  const avg = moods.length
    ? moods.reduce((a, b) => a + b, 0) / moods.length
    : 0;

  // Trend: first half vs second half of the week.
  let trend = "";
  if (moods.length >= 2) {
    const mid = Math.floor(moods.length / 2);
    const firstAvg = moods.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
    const secondAvg =
      moods.slice(mid).reduce((a, b) => a + b, 0) / (moods.length - mid);
    const diff = secondAvg - firstAvg;
    if (diff > 0.8) trend = " Venís de menos a más: el cierre de semana te encontró mejor.";
    else if (diff < -0.8) trend = " La semana se fue poniendo más cuesta arriba hacia el final.";
    else trend = " Te mantuviste bastante estable.";
  }

  // Top tags this week.
  const tagCounts = new Map<string, number>();
  for (const e of week) {
    for (const raw of e.tags ?? []) {
      const t = raw.trim().toLowerCase();
      if (t) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  const tagsLine = topTags.length
    ? ` Lo que más apareció: ${topTags.join(", ")}.`
    : "";

  const avgLine = moods.length
    ? ` Tu ánimo promedió ${avg.toFixed(1)} sobre 10.`
    : "";

  const text =
    `Esta semana registraste ${week.length} ${week.length === 1 ? "momento" : "momentos"}.` +
    avgLine +
    trend +
    tagsLine +
    " Gracias por hacerte este espacio.";

  return { hasData: true, text };
}

/** Compact, non-sensitive summary used to ask the LLM for recommendations. */
export function buildRecommendationContext(entries: MyEntry[]): string | null {
  const recap = buildWeeklyRecap(entries);
  if (!recap.hasData) return null;
  const { worries, brights } = computeThreads(entries);
  const worryTags = worries.slice(0, 5).map((t) => t.tag).join(", ") || "—";
  const brightTags = brights.slice(0, 5).map((t) => t.tag).join(", ") || "—";
  return [
    recap.text,
    `Temas que la preocupan: ${worryTags}.`,
    `Temas que la hacen bien: ${brightTags}.`,
  ].join(" ");
}
