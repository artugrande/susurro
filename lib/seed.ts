"use client";

/**
 * Seeds synthetic demo data (encrypted with the user's key) so the dashboard
 * shows a real one-week arc. SYNTHETIC DATA ONLY — an everyday person
 * navigating a partner, family, friends, a pet, loneliness, work and small
 * joys. Kept universal so anyone relates to it. Bilingual (ES/EN).
 */
import { encryptJSON } from "@/lib/crypto";
import { PROJECT_ATTRIBUTE, EntityType } from "@/lib/arkiv";
import { Attr, Expiry } from "@/lib/entities";
import type { Locale } from "@/lib/i18n";

const DAY = 86_400_000;

type MoodSeed = { daysAgo: number; value: number; note: string; tags: string[] };
type JournalSeed = { daysAgo: number; mood: number; text: string; tags: string[] };

// daysAgo 6 → 0 (today). 7 consecutive days → a one-week streak.
const MOOD_DAYS_ES: MoodSeed[] = [
  { daysAgo: 6, value: 6, note: "tuve una charla larga con mi vieja, de esas que hacía rato no teníamos", tags: ["familia", "vínculos"] },
  { daysAgo: 5, value: 3, note: "discutí con mi pareja por una pavada y quedamos los dos mal", tags: ["pareja", "discusión"] },
  { daysAgo: 4, value: 4, note: "quedó tenso en casa y encima dormí mal", tags: ["pareja", "sueño"] },
  { daysAgo: 3, value: 5, note: "medio bajón, pero salí a caminar con el perro y aflojó un poco", tags: ["mascota", "soledad"] },
  { daysAgo: 2, value: 7, note: "hablamos con mi pareja y empezamos a destrabar", tags: ["pareja", "reconciliación"] },
  { daysAgo: 1, value: 8, note: "cena con amigos en casa, me reí hasta que me dolió la panza", tags: ["amistad", "alegría"] },
  { daysAgo: 0, value: 7, note: "más en paz, arranqué el día con un mate y música, tranqui", tags: ["descanso", "calma"] },
];

const MOOD_DAYS_EN: MoodSeed[] = [
  { daysAgo: 6, value: 6, note: "had a long talk with my mom, the kind we hadn't had in a while", tags: ["family", "bonds"] },
  { daysAgo: 5, value: 3, note: "got into a fight with my partner over something small and we both ended up off", tags: ["partner", "argument"] },
  { daysAgo: 4, value: 4, note: "things stayed tense at home and on top of that I slept badly", tags: ["partner", "sleep"] },
  { daysAgo: 3, value: 5, note: "a bit low, but I took the dog for a walk and it eased a little", tags: ["pet", "loneliness"] },
  { daysAgo: 2, value: 7, note: "talked it through with my partner and started to unblock", tags: ["partner", "reconciliation"] },
  { daysAgo: 1, value: 8, note: "dinner with friends at home, I laughed until my stomach hurt", tags: ["friends", "joy"] },
  { daysAgo: 0, value: 7, note: "more at peace, started the day with tea and music, calm", tags: ["rest", "calm"] },
];

const JOURNALS_ES: JournalSeed[] = [
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

const JOURNALS_EN: JournalSeed[] = [
  {
    daysAgo: 5,
    mood: 3,
    text: "Got into a fight with my partner over something tiny and we both ended up hurt. I hate how a small thing escalates so fast. I kept thinking I sometimes react from tiredness, not from what I actually feel.",
    tags: ["partner", "argument"],
  },
  {
    daysAgo: 1,
    mood: 8,
    text: "Dinner with friends at home. Hadn't laughed like that in weeks. Being around people who knew me from before — people I don't have to explain anything to or pretend in front of — really helps.",
    tags: ["friends", "belonging"],
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
  /** Which locale's text to seed. Defaults to Spanish. */
  locale?: Locale;
}): Promise<{ ok: boolean; count: number; txHash?: string }> {
  const owner = params.owner.toLowerCase();
  const locale: Locale = params.locale ?? "es";
  const MOOD_DAYS = locale === "en" ? MOOD_DAYS_EN : MOOD_DAYS_ES;
  const JOURNALS = locale === "en" ? JOURNALS_EN : JOURNALS_ES;
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
