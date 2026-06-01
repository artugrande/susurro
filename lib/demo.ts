"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@/lib/i18n";
import type { MyEntry } from "@/lib/read";

const DAY = 86_400_000;

/**
 * Synthetic demo data for the pitch deck and landing showcase. SYNTHETIC ONLY.
 * One week with a believable trajectory: an okay start, a rough patch (a fight
 * at home, a sick pet), then a gradual recovery. Moods move gently day to day
 * (autocorrelated, not a zigzag) so the chart reads real. "pareja"/"partner"
 * shows up in both worries and brights — the conflict and the reconciliation.
 * Mirrors lib/seed.ts. 7 consecutive days → a full-week check-in streak.
 */
const ARC_ES: { d: number; mood: number; summary: string; tags: string[] }[] = [
  { d: 6, mood: 6, summary: "charla larga con mi vieja, hacía rato no hablábamos así", tags: ["familia", "vínculos"] },
  { d: 5, mood: 3, summary: "discutí con mi pareja por una pavada y quedamos mal", tags: ["pareja", "discusión"] },
  { d: 4, mood: 4, summary: "quedó tenso en casa y encima dormí mal", tags: ["pareja", "sueño"] },
  { d: 3, mood: 5, summary: "medio bajón, pero salí a caminar con el perro y aflojó", tags: ["mascota", "soledad"] },
  { d: 2, mood: 7, summary: "hablamos con mi pareja y empezamos a destrabar", tags: ["pareja", "reconciliación"] },
  { d: 1, mood: 8, summary: "cena con amigos en casa, me reí muchísimo", tags: ["amistad", "alegría"] },
  { d: 0, mood: 7, summary: "más en paz, arranqué con mate y música", tags: ["descanso", "calma"] },
];

const ARC_EN: { d: number; mood: number; summary: string; tags: string[] }[] = [
  { d: 6, mood: 6, summary: "long talk with my mom, we hadn't talked like that in a while", tags: ["family", "bonds"] },
  { d: 5, mood: 3, summary: "had a fight with my partner over something small and we ended up upset", tags: ["partner", "argument"] },
  { d: 4, mood: 4, summary: "things stayed tense at home and I slept badly on top of it", tags: ["partner", "sleep"] },
  { d: 3, mood: 5, summary: "a bit low, but I took the dog for a walk and it eased", tags: ["pet", "loneliness"] },
  { d: 2, mood: 7, summary: "we talked it through and started to unblock", tags: ["partner", "reconciliation"] },
  { d: 1, mood: 8, summary: "dinner with friends at home, I laughed a lot", tags: ["friends", "joy"] },
  { d: 0, mood: 7, summary: "more at peace, started the day with tea and music", tags: ["rest", "calm"] },
];

function build(locale: Locale): MyEntry[] {
  const arc = locale === "en" ? ARC_EN : ARC_ES;
  return arc.map((a, i) => ({
    entityKey: `demo-${i}`,
    type: "mood",
    mood: a.mood,
    summary: a.summary,
    tags: a.tags,
    created: Date.now() - a.d * DAY,
  }));
}

/** Hook: demo entries in the active locale (re-derived when locale changes). */
export function useDemoEntries(): MyEntry[] {
  const locale = useLocale();
  return useMemo(() => build(locale), [locale]);
}

/** Plain function for places without React context (rare). Defaults to ES. */
export function getDemoEntries(locale: Locale = "es"): MyEntry[] {
  return build(locale);
}

// Back-compat: previously a constant. Kept (Spanish) for any legacy import.
export const DEMO_ENTRIES = build("es");
