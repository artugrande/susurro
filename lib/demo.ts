import type { MyEntry } from "@/lib/read";

const DAY = 86_400_000;

/**
 * Synthetic demo data for the pitch deck and landing showcase. SYNTHETIC ONLY.
 * One week with a believable trajectory: an okay start, a rough patch (a fight
 * at home, a sick pet), then a gradual recovery. Moods move gently day to day
 * (autocorrelated, not a zigzag) so the chart reads real. "pareja" shows up in
 * both worries and brights — the conflict and the reconciliation.
 * Mirrors lib/seed.ts. 7 consecutive days → a full-week check-in streak.
 */
const ARC: { d: number; mood: number; summary: string; tags: string[] }[] = [
  { d: 6, mood: 6, summary: "charla larga con mi vieja, hacía rato no hablábamos así", tags: ["familia", "vínculos"] },
  { d: 5, mood: 3, summary: "discutí con mi pareja por una pavada y quedamos mal", tags: ["pareja", "discusión"] },
  { d: 4, mood: 4, summary: "quedó tenso en casa y encima dormí mal", tags: ["pareja", "sueño"] },
  { d: 3, mood: 5, summary: "medio bajón, pero salí a caminar con el perro y aflojó", tags: ["mascota", "soledad"] },
  { d: 2, mood: 7, summary: "hablamos con mi pareja y empezamos a destrabar", tags: ["pareja", "reconciliación"] },
  { d: 1, mood: 8, summary: "cena con amigos en casa, me reí muchísimo", tags: ["amistad", "alegría"] },
  { d: 0, mood: 7, summary: "más en paz, arranqué con mate y música", tags: ["descanso", "calma"] },
];

export const DEMO_ENTRIES: MyEntry[] = ARC.map((a, i) => ({
  entityKey: `demo-${i}`,
  type: "mood",
  mood: a.mood,
  summary: a.summary,
  tags: a.tags,
  created: Date.now() - a.d * DAY,
}));
