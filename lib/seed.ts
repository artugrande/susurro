"use client";

/**
 * Seeds synthetic demo data (encrypted with the user's key) so the dashboard
 * shows a real 2-week streak with ups and downs. SYNTHETIC DATA ONLY —
 * a developer in Salta: their dog Matías, work, and Boca Juniors losing.
 */
import { encryptJSON } from "@/lib/crypto";
import { PROJECT_ATTRIBUTE, EntityType } from "@/lib/arkiv";
import { Attr, Expiry } from "@/lib/entities";

const DAY = 86_400_000;

// daysAgo 13 → 0 (today). Consecutive days → a 14-day streak.
const MOOD_DAYS: { daysAgo: number; value: number; note: string; tags: string[] }[] = [
  { daysAgo: 13, value: 7, note: "arranqué un proyecto nuevo en el laburo, con energía", tags: ["trabajo", "energía"] },
  { daysAgo: 12, value: 8, note: "Matías me despertó temprano pero me sacó una sonrisa", tags: ["mascota"] },
  { daysAgo: 11, value: 2, note: "domingo, perdió Boca. bajón total", tags: ["boca", "fútbol", "bajón"] },
  { daysAgo: 10, value: 4, note: "lunes pesado, mucho código y poco café", tags: ["trabajo", "cansancio"] },
  { daysAgo: 9, value: 7, note: "salí a correr por el San Bernardo, me despejó", tags: ["ejercicio", "naturaleza"] },
  { daysAgo: 8, value: 3, note: "bug en producción, día tenso", tags: ["trabajo", "estrés"] },
  { daysAgo: 7, value: 8, note: "lo resolví y me felicitó el equipo", tags: ["trabajo", "logro"] },
  { daysAgo: 6, value: 3, note: "Matías se enfermó, lo llevé al veterinario", tags: ["mascota", "preocupación"] },
  { daysAgo: 5, value: 8, note: "Matías ya está mejor, alivio enorme", tags: ["mascota", "alivio"] },
  { daysAgo: 4, value: 4, note: "discutí con un compañero por una decisión técnica", tags: ["trabajo", "conflicto"] },
  { daysAgo: 3, value: 9, note: "asado con amigos, me hizo bien desconectar", tags: ["amigos"] },
  { daysAgo: 2, value: 6, note: "Boca empató sobre la hora, al menos no perdió", tags: ["boca", "fútbol"] },
  { daysAgo: 1, value: 5, note: "ansioso por la demo del hackathon", tags: ["trabajo", "ansiedad"] },
  { daysAgo: 0, value: 6, note: "dormí poco pero con ganas de mostrar lo que construí", tags: ["trabajo", "sueño"] },
];

const JOURNALS: { daysAgo: number; mood: number; text: string; tags: string[] }[] = [
  {
    daysAgo: 11,
    mood: 2,
    text: "Perdió Boca de local y me arruinó el domingo. Sé que es solo fútbol, pero me bajonea más de lo que admito. Encima estaba solo en casa.",
    tags: ["boca", "fútbol", "bajón"],
  },
  {
    daysAgo: 6,
    mood: 3,
    text: "Matías no quería comer y me asusté. Lo llevé al veterinario a la tarde. Me di cuenta de lo importante que es para mí ese perro.",
    tags: ["mascota", "preocupación"],
  },
  {
    daysAgo: 3,
    mood: 9,
    text: "Asado con los chicos. Hacía semanas que no me reía así. Desconectar del código y estar con gente me recarga las pilas.",
    tags: ["amigos", "descanso"],
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
