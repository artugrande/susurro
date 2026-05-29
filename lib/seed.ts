"use client";

/**
 * Seeds synthetic demo data (encrypted with the user's key) so the dashboard
 * shows a real 2-week streak with ups and downs. SYNTHETIC DATA ONLY —
 * an everyday person navigating a partner, family, friends, their dog,
 * loneliness, work and small joys. Kept universal so anyone relates to it.
 */
import { encryptJSON } from "@/lib/crypto";
import { PROJECT_ATTRIBUTE, EntityType } from "@/lib/arkiv";
import { Attr, Expiry } from "@/lib/entities";

const DAY = 86_400_000;

// daysAgo 6 → 0 (today). Consecutive days → a full-week streak.
// A believable arc: okay start → a rough patch (a fight, a sick pet) →
// gradual recovery. Moods move gently day to day, not in a zigzag.
const MOOD_DAYS: { daysAgo: number; value: number; note: string; tags: string[] }[] = [
  { daysAgo: 6, value: 6, note: "tuve una charla larga con mi vieja, de esas que hacía rato no teníamos", tags: ["familia", "vínculos"] },
  { daysAgo: 5, value: 3, note: "discutí con mi pareja por una pavada y quedamos los dos mal", tags: ["pareja", "discusión"] },
  { daysAgo: 4, value: 4, note: "quedó tenso en casa y encima dormí mal", tags: ["pareja", "sueño"] },
  { daysAgo: 3, value: 5, note: "medio bajón, pero salí a caminar con el perro y aflojó un poco", tags: ["mascota", "soledad"] },
  { daysAgo: 2, value: 7, note: "hablamos con mi pareja y empezamos a destrabar", tags: ["pareja", "reconciliación"] },
  { daysAgo: 1, value: 8, note: "cena con amigos en casa, me reí hasta que me dolió la panza", tags: ["amistad", "alegría"] },
  { daysAgo: 0, value: 7, note: "más en paz, arranqué el día con un mate y música, tranqui", tags: ["descanso", "calma"] },
];

const JOURNALS: { daysAgo: number; mood: number; text: string; tags: string[] }[] = [
  {
    daysAgo: 5,
    mood: 3,
    text: "Discutí con mi pareja por algo mínimo y terminamos los dos heridos. Odio cómo una pavada escala tan rápido. Me quedé pensando que a veces reacciono desde el cansancio y no desde lo que siento de verdad.",
    tags: ["pareja", "discusión"],
  },
  {
    daysAgo: 1,
    mood: 8,
    text: "Cena con amigos en casa. Hacía semanas que no me reía así. Me hace bien rodearme de gente que me conoce de antes, con la que no tengo que explicar nada ni hacer de cuenta que estoy bien.",
    tags: ["amistad", "pertenencia"],
  },
];

interface SeedItem {
  entityType: string;
  attributes: { key: string; value: string | number }[];
  payload: unknown;
  expiresIn: number;
}

export async function seedDemoData(params: {
  owner: string;
  key: CryptoKey;
}): Promise<{ ok: boolean; count: number; txHash?: string }> {
  const owner = params.owner.toLowerCase();
  const items: SeedItem[] = [];

  for (const d of MOOD_DAYS) {
    const createdAt = Date.now() - d.daysAgo * DAY;
    const ciphertext = await encryptJSON(
      { note: d.note, tags: d.tags },
      params.key,
    );
    items.push({
      entityType: EntityType.Mood,
      attributes: [
        PROJECT_ATTRIBUTE,
        { key: Attr.type, value: EntityType.Mood },
        { key: Attr.owner, value: owner },
        { key: Attr.value, value: d.value },
        { key: Attr.created, value: createdAt },
        { key: Attr.dayOfWeek, value: new Date(createdAt).getDay() },
      ],
      payload: { ciphertext },
      expiresIn: Number(Expiry.mood()),
    });
  }

  for (const j of JOURNALS) {
    const createdAt = Date.now() - j.daysAgo * DAY;
    const ciphertext = await encryptJSON(
      { text: j.text, tags: j.tags },
      params.key,
    );
    items.push({
      entityType: EntityType.Journal,
      attributes: [
        PROJECT_ATTRIBUTE,
        { key: Attr.type, value: EntityType.Journal },
        { key: Attr.owner, value: owner },
        { key: Attr.mood, value: j.mood },
        { key: Attr.created, value: createdAt },
      ],
      payload: { ciphertext },
      expiresIn: Number(Expiry.journal()),
    });
  }

  const res = await fetch("/api/arkiv/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`seed failed: ${res.status}`);
  return (await res.json()) as { ok: boolean; count: number; txHash?: string };
}
