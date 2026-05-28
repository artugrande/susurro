"use client";

/**
 * Client-side read helpers. Query Arkiv (public client) and decrypt payloads
 * with the user's key. Used by the coach's clientTools when a grant is active.
 */
import { decryptJSON } from "@/lib/crypto";
import { queryRecentMood, queryRecentJournal } from "@/lib/entities";

/** A unified, decrypted view of one of the user's entries (for the UI list). */
export interface MyEntry {
  entityKey: string;
  type: "mood" | "journal";
  mood: number;
  summary: string;
  created: number;
}

/** All of the user's entries (mood + journal), decrypted, newest first. */
export async function getMyEntries(
  owner: string,
  key: CryptoKey,
): Promise<MyEntry[]> {
  const [moods, journals] = await Promise.all([
    queryRecentMood(owner, 3650),
    queryRecentJournal(owner, 3650),
  ]);
  const out: MyEntry[] = [];
  for (const e of moods) {
    let note = "";
    try {
      const p = JSON.parse(e.payload) as { ciphertext?: string };
      if (p.ciphertext)
        note = (await decryptJSON<{ note: string }>(p.ciphertext, key)).note;
    } catch {
      /* skip */
    }
    out.push({
      entityKey: e.entityKey,
      type: "mood",
      mood: Number(e.attributes.value ?? 0),
      summary: note,
      created: Number(e.attributes.created ?? 0),
    });
  }
  for (const e of journals) {
    let text = "";
    try {
      const p = JSON.parse(e.payload) as { ciphertext?: string };
      if (p.ciphertext)
        text = (await decryptJSON<{ text: string }>(p.ciphertext, key)).text;
    } catch {
      /* skip */
    }
    out.push({
      entityKey: e.entityKey,
      type: "journal",
      mood: Number(e.attributes.mood ?? 0),
      summary: text,
      created: Number(e.attributes.created ?? 0),
    });
  }
  return out.sort((a, b) => b.created - a.created);
}

export interface DecryptedMood {
  value: number;
  note: string;
  created: number;
  dayOfWeek: number;
}

export interface DecryptedJournal {
  text: string;
  mood: number;
  created: number;
}

export async function getDecryptedMood(
  owner: string,
  days: number,
  key: CryptoKey,
): Promise<DecryptedMood[]> {
  const ents = await queryRecentMood(owner, days);
  const out: DecryptedMood[] = [];
  for (const e of ents) {
    let note = "";
    try {
      const p = JSON.parse(e.payload) as { ciphertext?: string };
      if (p.ciphertext) {
        note = (await decryptJSON<{ note: string }>(p.ciphertext, key)).note;
      }
    } catch {
      /* skip undecryptable */
    }
    out.push({
      value: Number(e.attributes.value ?? 0),
      note,
      created: Number(e.attributes.created ?? 0),
      dayOfWeek: Number(e.attributes.dayOfWeek ?? 0),
    });
  }
  return out.sort((a, b) => b.created - a.created);
}

export async function getDecryptedJournal(
  owner: string,
  days: number,
  key: CryptoKey,
): Promise<DecryptedJournal[]> {
  const ents = await queryRecentJournal(owner, days);
  const out: DecryptedJournal[] = [];
  for (const e of ents) {
    let text = "";
    try {
      const p = JSON.parse(e.payload) as { ciphertext?: string };
      if (p.ciphertext) {
        text = (await decryptJSON<{ text: string }>(p.ciphertext, key)).text;
      }
    } catch {
      /* skip undecryptable */
    }
    out.push({
      text,
      mood: Number(e.attributes.mood ?? 0),
      created: Number(e.attributes.created ?? 0),
    });
  }
  return out.sort((a, b) => b.created - a.created);
}
