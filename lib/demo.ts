import type { MyEntry } from "@/lib/read";

const DAY = 86_400_000;

/**
 * Synthetic demo data for the pitch deck and landing showcase. SYNTHETIC ONLY.
 * A relatable everyday 2-week arc (partner, family, friends, pet, loneliness,
 * anxiety, calm). 14 consecutive days → a real 14-day check-in streak.
 * Mirrors lib/seed.ts so the deck/landing match what a real user would see.
 */
const ARC: { d: number; mood: number; summary: string; tags: string[] }[] = [
  { d: 13, mood: 6, summary: "charla larga con mi vieja", tags: ["familia", "vínculos"] },
  { d: 12, mood: 8, summary: "café eterno con una amiga que no veía hace meses", tags: ["amistad", "reencuentro"] },
  { d: 11, mood: 3, summary: "discutí con mi pareja por una pavada", tags: ["pareja", "discusión"] },
  { d: 10, mood: 4, summary: "lunes a full, llegué sin energía", tags: ["trabajo", "cansancio"] },
  { d: 9, mood: 7, summary: "caminé con el perro al atardecer", tags: ["mascota", "naturaleza"] },
  { d: 8, mood: 3, summary: "me sentí solo hasta tarde", tags: ["soledad", "ánimo"] },
  { d: 7, mood: 8, summary: "nos pedimos perdón con mi pareja", tags: ["pareja", "reconciliación"] },
  { d: 6, mood: 3, summary: "el perro se enfermó, lo llevé al veterinario", tags: ["mascota", "preocupación"] },
  { d: 5, mood: 8, summary: "el perro ya está mejor, alivio enorme", tags: ["mascota", "alivio"] },
  { d: 4, mood: 5, summary: "día gris, cociné algo rico y me hizo bien", tags: ["ánimo", "cocina"] },
  { d: 3, mood: 9, summary: "cena con amigos, me reí muchísimo", tags: ["amistad", "alegría"] },
  { d: 2, mood: 6, summary: "extrañé a mi familia que vive lejos, los llamé", tags: ["familia", "distancia"] },
  { d: 1, mood: 5, summary: "ansioso por una decisión que tengo que tomar", tags: ["ansiedad", "futuro"] },
  { d: 0, mood: 7, summary: "mate y música a la mañana, tranqui", tags: ["descanso", "calma"] },
];

export const DEMO_ENTRIES: MyEntry[] = ARC.map((a, i) => ({
  entityKey: `demo-${i}`,
  type: "mood",
  mood: a.mood,
  summary: a.summary,
  tags: a.tags,
  created: Date.now() - a.d * DAY,
}));
