import type { MyEntry } from "@/lib/read";

const DAY = 86_400_000;

/**
 * Synthetic demo data for the pitch deck and landing showcase. SYNTHETIC ONLY.
 * A relatable 2-week arc with a believable trajectory: an okay start, a rough
 * patch mid-week (a fight at home, a sick pet), then a gradual recovery. Moods
 * move gently day to day (autocorrelated, not a zigzag) so the chart reads real.
 * Mirrors lib/seed.ts so the deck/landing match what a real user would see.
 * 14 consecutive days → a real 14-day check-in streak.
 */
const ARC: { d: number; mood: number; summary: string; tags: string[] }[] = [
  { d: 13, mood: 6, summary: "charla larga con mi vieja, hacía rato no hablábamos así", tags: ["familia", "vínculos"] },
  { d: 12, mood: 7, summary: "me crucé con una amiga que no veía hace meses, café eterno", tags: ["amistad", "reencuentro"] },
  { d: 11, mood: 5, summary: "la semana arrancó cargada en el laburo", tags: ["trabajo", "cansancio"] },
  { d: 10, mood: 3, summary: "discutí con mi pareja por una pavada y quedamos mal", tags: ["pareja", "discusión"] },
  { d: 9, mood: 3, summary: "quedó tenso en casa y encima dormí mal", tags: ["pareja", "sueño"] },
  { d: 8, mood: 4, summary: "medio bajón, pero salí a caminar con el perro y aflojó", tags: ["mascota", "soledad"] },
  { d: 7, mood: 6, summary: "hablamos con mi pareja y empezamos a destrabar", tags: ["pareja", "reconciliación"] },
  { d: 6, mood: 4, summary: "el perro no quería comer, lo llevé al veterinario", tags: ["mascota", "preocupación"] },
  { d: 5, mood: 7, summary: "el perro ya está mejor, alivio enorme", tags: ["mascota", "alivio"] },
  { d: 4, mood: 6, summary: "día tranqui, cociné algo rico y me hizo bien", tags: ["cocina", "calma"] },
  { d: 3, mood: 8, summary: "cena con amigos en casa, me reí muchísimo", tags: ["amistad", "alegría"] },
  { d: 2, mood: 7, summary: "extrañé a mi familia que vive lejos, los llamé y estuvo bueno", tags: ["familia", "vínculos"] },
  { d: 1, mood: 7, summary: "más en paz con una decisión que venía postergando", tags: ["futuro", "calma"] },
  { d: 0, mood: 8, summary: "dormí bien y arranqué con mate y música", tags: ["descanso", "calma"] },
];

export const DEMO_ENTRIES: MyEntry[] = ARC.map((a, i) => ({
  entityKey: `demo-${i}`,
  type: "mood",
  mood: a.mood,
  summary: a.summary,
  tags: a.tags,
  created: Date.now() - a.d * DAY,
}));
