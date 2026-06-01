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

/** i18n shape buildWeeklyRecap accepts so it can render in ES or EN. */
export interface RecapI18n {
  t: (key: string, vars?: Record<string, string | number>) => string;
  locale: "es" | "en";
}

/** Build a warm, data-driven recap of the last 7 days (no LLM), localized. */
export function buildWeeklyRecap(
  entries: MyEntry[],
  i18n?: RecapI18n,
): WeeklyRecap {
  // Translate via passed `t`. Without an i18n arg, fall back to a Spanish
  // template so any existing caller stays working.
  const t =
    i18n?.t ??
    ((k: string, _vars?: Record<string, string | number>) => {
      // Minimal ES fallback (kept simple — the live app always passes i18n).
      const FALLBACK: Record<string, string> = {
        "recap.empty":
          "Todavía no hay registros esta semana. Hacé un check-in conmigo y te armo tu resumen.",
      };
      return FALLBACK[k] ?? "";
    });

  const since = Date.now() - 7 * DAY;
  const week = entries
    .filter((e) => e.created >= since)
    .sort((a, b) => a.created - b.created);

  if (week.length === 0) {
    return { hasData: false, text: t("recap.empty") };
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
    if (diff > 0.8) trend = t("recap.trendUp");
    else if (diff < -0.8) trend = t("recap.trendDown");
    else trend = t("recap.trendFlat");
  }

  // Top tags this week.
  const tagCounts = new Map<string, number>();
  for (const e of week) {
    for (const raw of e.tags ?? []) {
      const tg = raw.trim().toLowerCase();
      if (tg) tagCounts.set(tg, (tagCounts.get(tg) ?? 0) + 1);
    }
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tg]) => tg);

  const tagsLine = topTags.length
    ? t("recap.topTags", { tags: topTags.join(", ") })
    : "";

  const avgLine = moods.length
    ? t("recap.avgLine", { avg: avg.toFixed(1) })
    : "";

  const moments =
    week.length === 1 ? t("recap.momentOne") : t("recap.momentMany");

  const text =
    t("recap.thisWeekN", { n: week.length, label: moments }) +
    avgLine +
    trend +
    tagsLine +
    t("recap.thanks");

  return { hasData: true, text };
}

/**
 * Context for the LLM recommendations: the week's actual entries (mood + what
 * the person shared + tags) so the advice connects to their real situation,
 * not generic tips. Notes are truncated; only the last week is included.
 */
export function buildRecommendationContext(entries: MyEntry[]): string | null {
  const since = Date.now() - 7 * DAY;
  const week = entries
    .filter((e) => e.created >= since)
    .sort((a, b) => b.created - a.created);
  if (week.length === 0) return null;

  const { worries, brights } = computeThreads(entries);
  const worryTags = worries.slice(0, 5).map((t) => t.tag).join(", ") || "—";
  const brightTags = brights.slice(0, 5).map((t) => t.tag).join(", ") || "—";

  const lines = week.slice(0, 12).map((e) => {
    const note = e.summary ? e.summary.slice(0, 160) : "(sin nota)";
    const tags = e.tags.length ? ` [${e.tags.join(", ")}]` : "";
    return `- ánimo ${e.mood}/10: ${note}${tags}`;
  });

  return [
    `Lo que la pone mal: ${worryTags}.`,
    `Lo que la hace bien: ${brightTags}.`,
    "Registros de la semana (ánimo + qué compartió):",
    ...lines,
  ].join("\n");
}
