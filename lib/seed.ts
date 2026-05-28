"use client";

/**
 * Seeds synthetic demo data (encrypted with the user's key) so the coach's
 * recall tools have a realistic history to read. SYNTHETIC DATA ONLY.
 */
import { encryptJSON } from "@/lib/crypto";
import { PROJECT_ATTRIBUTE, EntityType } from "@/lib/arkiv";
import { Attr, Expiry } from "@/lib/entities";

const DAY = 86_400_000;

const MOOD_NOTES = [
  "día tranquilo",
  "mucho laburo, medio saturada",
  "dormí mal",
  "salí a caminar y me hizo bien",
  "ansiosa por una entrega",
  "charla linda con un amigo",
  "domingo lento, bajón",
  "entrené y me subió el ánimo",
  "discutí en casa",
  "día normal",
  "me costó arrancar",
  "tarde productiva",
  "extrañé a alguien",
  "cierre de semana pesado",
];

const MOOD_TAGS: string[][] = [
  ["calma"],
  ["trabajo", "estrés"],
  ["sueño"],
  ["ejercicio", "naturaleza"],
  ["trabajo", "ansiedad"],
  ["amigos"],
  ["domingo", "bajón"],
  ["ejercicio"],
  ["familia"],
  ["rutina"],
  ["energía"],
  ["trabajo", "logro"],
  ["soledad"],
  ["trabajo", "cansancio"],
];

const JOURNALS = [
  {
    daysAgo: 11,
    mood: 3,
    text: "Hoy fue un domingo difícil. Me quedé en la cama hasta tarde y sentí que el día se me escapaba. Me cuesta los domingos.",
    tags: ["domingo", "bajón"],
  },
  {
    daysAgo: 6,
    mood: 7,
    text: "Salí a caminar por el parque y me crucé con una amiga. Charlamos un rato largo. Me di cuenta de que hablar me destraba.",
    tags: ["amigos", "naturaleza"],
  },
  {
    daysAgo: 2,
    mood: 4,
    text: "Mucha presión con la entrega del trabajo. Siento el cuerpo tenso. Necesito organizar mejor los tiempos.",
    tags: ["trabajo", "ansiedad"],
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
}): Promise<{ ok: boolean; count: number }> {
  const owner = params.owner.toLowerCase();
  const items: SeedItem[] = [];

  // 14 days of mood check-ins; Sundays trend lower for a visible pattern.
  for (let i = 13; i >= 0; i--) {
    const createdAt = Date.now() - i * DAY;
    const dow = new Date(createdAt).getDay();
    const value = dow === 0 ? 3 + (i % 2) : 5 + (i % 4);
    const idx = i % MOOD_NOTES.length;
    const note = MOOD_NOTES[idx];
    const ciphertext = await encryptJSON(
      { note, tags: MOOD_TAGS[idx] },
      params.key,
    );
    items.push({
      entityType: EntityType.Mood,
      attributes: [
        PROJECT_ATTRIBUTE,
        { key: Attr.type, value: EntityType.Mood },
        { key: Attr.owner, value: owner },
        { key: Attr.value, value },
        { key: Attr.created, value: createdAt },
        { key: Attr.dayOfWeek, value: dow },
      ],
      payload: { ciphertext },
      expiresIn: Number(Expiry.mood()),
    });
  }

  // A few journal entries.
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
  return (await res.json()) as { ok: boolean; count: number };
}
