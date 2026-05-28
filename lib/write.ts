"use client";

/**
 * Client-side write helpers. They encrypt sensitive payloads with the user's
 * key, build attributes, and POST to our API (which signs + pays gas with the
 * app wallet). Sensitive content is encrypted before it ever leaves the browser.
 */
import { encryptJSON } from "@/lib/crypto";
import { EntityType } from "@/lib/arkiv";
import {
  buildJournalAttributes,
  buildMoodAttributes,
  buildGrantAttributes,
  buildAccessLogAttributes,
  buildSubscriptionAttributes,
  Expiry,
  type EntityScope,
  type ArkivAttribute,
} from "@/lib/entities";

interface CreateResult {
  entityKey: string;
  txHash: string;
}

async function postCreate(body: {
  entityType: string;
  attributes: ArkivAttribute[];
  payload: unknown;
  expiresIn: number;
}): Promise<CreateResult> {
  const res = await fetch("/api/arkiv/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, expiresIn: Number(body.expiresIn) }),
  });
  if (!res.ok) throw new Error(`create failed: ${res.status}`);
  return (await res.json()) as CreateResult;
}

export async function saveMoodCheckin(p: {
  owner: string;
  value: number;
  note?: string;
  key: CryptoKey;
}): Promise<CreateResult> {
  const payload = {
    ciphertext: await encryptJSON({ note: p.note ?? "" }, p.key),
  };
  return postCreate({
    entityType: EntityType.Mood,
    attributes: buildMoodAttributes({ owner: p.owner, value: p.value }),
    payload,
    expiresIn: Expiry.mood(),
  });
}

export async function saveJournalEntry(p: {
  owner: string;
  text: string;
  mood: number;
  prompt?: string;
  sessionId?: string;
  key: CryptoKey;
}): Promise<CreateResult> {
  const payload = {
    ciphertext: await encryptJSON({ text: p.text, prompt: p.prompt }, p.key),
  };
  return postCreate({
    entityType: EntityType.Journal,
    attributes: buildJournalAttributes({
      owner: p.owner,
      mood: p.mood,
      sessionId: p.sessionId,
    }),
    payload,
    expiresIn: Expiry.journal(),
  });
}

export async function createGrant(p: {
  owner: string;
  grantee: string;
  scope: EntityScope[];
  durationSeconds: number;
}): Promise<CreateResult> {
  const now = Date.now();
  return postCreate({
    entityType: EntityType.Grant,
    attributes: buildGrantAttributes({
      owner: p.owner,
      grantee: p.grantee,
      scope: p.scope,
      durationSeconds: p.durationSeconds,
    }),
    payload: {
      scope: p.scope,
      grantedAt: now,
      expiresAt: now + p.durationSeconds * 1000,
    },
    expiresIn: p.durationSeconds,
  });
}

export async function writeAccessLog(p: {
  owner: string;
  grantee: string;
  action: string;
  description: string;
  entitiesRead: string[];
  sessionId?: string;
}): Promise<CreateResult> {
  return postCreate({
    entityType: EntityType.Log,
    attributes: buildAccessLogAttributes({
      owner: p.owner,
      grantee: p.grantee,
      action: p.action,
      sessionId: p.sessionId,
    }),
    payload: {
      action: p.action,
      description: p.description,
      entitiesRead: p.entitiesRead,
    },
    expiresIn: Expiry.log(),
  });
}

export async function renewSubscription(p: {
  owner: string;
}): Promise<CreateResult> {
  return postCreate({
    entityType: EntityType.Subscription,
    attributes: buildSubscriptionAttributes({ owner: p.owner }),
    payload: { plan: "monthly" },
    expiresIn: Expiry.subscription(),
  });
}

export async function revokeGrant(p: {
  entityKey: string;
  owner: string;
}): Promise<{ ok: boolean }> {
  const res = await fetch("/api/arkiv/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!res.ok) throw new Error(`revoke failed: ${res.status}`);
  return (await res.json()) as { ok: boolean };
}
