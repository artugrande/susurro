/**
 * Susurro entity model on Arkiv.
 *
 * Six entity types. Encrypted payloads hold the sensitive content; attributes
 * are public (they are the index). We never put secret content in attributes —
 * only what we need to query by.
 *
 * Trust model: the app wallet is the immutable $creator of every entity, so
 * reads filter by `.createdBy(APP_WALLET)` to reject injected data. User
 * ownership is tracked via the `owner` attribute (their connected wallet).
 */
import { eq, gt } from "@arkiv-network/sdk/query";
import { ExpirationTime } from "@arkiv-network/sdk/utils";
import {
  PROJECT_ATTRIBUTE,
  EntityType,
  getPublicClient,
  APP_WALLET_ADDRESS,
} from "./arkiv";

// ---------------------------------------------------------------------------
// Decrypted payload shapes (what lives, encrypted, inside `payload`)
// ---------------------------------------------------------------------------

export interface JournalPayload {
  text: string;
  prompt?: string; // coach prompt that elicited this entry
}

export interface MoodPayload {
  note?: string;
}

export interface InsightPayload {
  observation: string;
  suggestion?: string;
}

// Grant / log / subscription payloads are NOT encrypted (public by design).
export interface GrantPayload {
  scope: EntityScope[];
  grantedAt: number;
}

export interface AccessLogPayload {
  action: string; // e.g. "query-mood", "recall-context"
  entitiesRead: string[]; // entity keys the coach touched
  description: string; // human-readable, e.g. "leyó mood de últimos 7 días"
}

export interface SubscriptionPayload {
  plan: "free" | "monthly";
}

/** What a grant can expose to the coach. */
export type EntityScope = "mood-checkin" | "journal-entry" | "coach-insight";

// ---------------------------------------------------------------------------
// Attribute keys (shared between create + query so they never drift)
// ---------------------------------------------------------------------------

export const Attr = {
  type: "entityType",
  owner: "owner",
  grantee: "grantee", // coach wallet (placeholder in V1, ERC-8004 in V2)
  coachAddress: "coachAddress", // reserved for V2
  created: "created",
  expiresAt: "expiresAt",
  mood: "mood",
  value: "value",
  dayOfWeek: "dayOfWeek",
  scope: "scope",
  sessionId: "sessionId",
  action: "action",
  urgency: "urgency",
  relatedTo: "relatedTo",
} as const;

export type ArkivAttribute = { key: string; value: string | number };

/** Expiration policy per entity type — intentional lifetimes are judged. */
export const Expiry = {
  journal: () => ExpirationTime.fromDays(365),
  mood: () => ExpirationTime.fromDays(90),
  log: () => ExpirationTime.fromDays(365),
  insight: () => ExpirationTime.fromDays(365),
  subscription: () => ExpirationTime.fromDays(30),
} as const;

// ---------------------------------------------------------------------------
// Create-request builders (run client-side; ciphertext attached separately)
// ---------------------------------------------------------------------------

export interface CreateRequest {
  entityType: string;
  attributes: ArkivAttribute[];
  /** base64 ciphertext for encrypted types; plaintext JSON string otherwise */
  payload: string;
  contentType: string;
  expiresIn: number;
}

export function buildJournalAttributes(p: {
  owner: string;
  mood: number;
  sessionId?: string;
}): ArkivAttribute[] {
  return [
    PROJECT_ATTRIBUTE,
    { key: Attr.type, value: EntityType.Journal },
    { key: Attr.owner, value: p.owner.toLowerCase() },
    { key: Attr.mood, value: p.mood },
    { key: Attr.created, value: Date.now() },
    ...(p.sessionId ? [{ key: Attr.sessionId, value: p.sessionId }] : []),
  ];
}

export function buildMoodAttributes(p: {
  owner: string;
  value: number;
}): ArkivAttribute[] {
  return [
    PROJECT_ATTRIBUTE,
    { key: Attr.type, value: EntityType.Mood },
    { key: Attr.owner, value: p.owner.toLowerCase() },
    { key: Attr.value, value: p.value },
    { key: Attr.created, value: Date.now() },
    { key: Attr.dayOfWeek, value: new Date().getDay() },
  ];
}

export function buildGrantAttributes(p: {
  owner: string;
  grantee: string;
  scope: EntityScope[];
  durationSeconds: number;
}): ArkivAttribute[] {
  const now = Date.now();
  return [
    PROJECT_ATTRIBUTE,
    { key: Attr.type, value: EntityType.Grant },
    { key: Attr.owner, value: p.owner.toLowerCase() },
    { key: Attr.grantee, value: p.grantee.toLowerCase() },
    { key: Attr.scope, value: p.scope.join(",") },
    { key: Attr.created, value: now },
    { key: Attr.expiresAt, value: now + p.durationSeconds * 1000 },
  ];
}

export function buildAccessLogAttributes(p: {
  owner: string;
  grantee: string;
  action: string;
  sessionId?: string;
}): ArkivAttribute[] {
  return [
    PROJECT_ATTRIBUTE,
    { key: Attr.type, value: EntityType.Log },
    { key: Attr.owner, value: p.owner.toLowerCase() },
    { key: Attr.grantee, value: p.grantee.toLowerCase() },
    { key: Attr.action, value: p.action },
    { key: Attr.created, value: Date.now() },
    ...(p.sessionId ? [{ key: Attr.sessionId, value: p.sessionId }] : []),
  ];
}

export function buildInsightAttributes(p: {
  owner: string;
  urgency: number;
  relatedTo?: string;
}): ArkivAttribute[] {
  return [
    PROJECT_ATTRIBUTE,
    { key: Attr.type, value: EntityType.Insight },
    { key: Attr.owner, value: p.owner.toLowerCase() },
    { key: Attr.urgency, value: p.urgency },
    { key: Attr.created, value: Date.now() },
    ...(p.relatedTo ? [{ key: Attr.relatedTo, value: p.relatedTo }] : []),
  ];
}

export function buildSubscriptionAttributes(p: {
  owner: string;
}): ArkivAttribute[] {
  return [
    PROJECT_ATTRIBUTE,
    { key: Attr.type, value: EntityType.Subscription },
    { key: Attr.owner, value: p.owner.toLowerCase() },
    { key: Attr.created, value: Date.now() },
  ];
}

/** Entity types the API route is allowed to write (server-side validation). */
export const ALLOWED_ENTITY_TYPES: string[] = Object.values(EntityType);

// ---------------------------------------------------------------------------
// Read / query helpers (public client; safe in browser)
// ---------------------------------------------------------------------------

export interface QueriedEntity {
  entityKey: string;
  attributes: Record<string, string | number>;
  payload: string; // base64 ciphertext or plaintext JSON
}

function attrsToRecord(
  attrs: { key: string; value: string | number }[] | undefined,
): Record<string, string | number> {
  const rec: Record<string, string | number> = {};
  for (const a of attrs ?? []) rec[a.key] = a.value;
  return rec;
}

interface RawEntity {
  entityKey?: string;
  key?: string;
  attributes?: { key: string; value: string | number }[];
  toJson?: () => unknown;
  payload?: unknown;
}

function normalize(e: RawEntity): QueriedEntity {
  const payload =
    typeof e.toJson === "function"
      ? (e.toJson() as string)
      : ((e.payload as string) ?? "");
  return {
    entityKey: e.entityKey ?? e.key ?? "",
    attributes: attrsToRecord(e.attributes),
    payload: typeof payload === "string" ? payload : JSON.stringify(payload),
  };
}

/** All entities of a type owned by a user, created by our trusted app wallet.
 *
 * Pass `withPayload: false` when you only need entity keys/attributes (e.g.
 * for bulk delete) — much lighter on the RPC and avoids timeouts on bigger
 * result sets, since the node doesn't have to fetch the (often large)
 * encrypted payloads. */
export async function queryByType(opts: {
  owner: string;
  entityType: string;
  sinceMs?: number;
  limit?: number;
  withPayload?: boolean;
}): Promise<QueriedEntity[]> {
  const pub = getPublicClient();
  const filters = [
    eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
    eq(Attr.type, opts.entityType),
    eq(Attr.owner, opts.owner.toLowerCase()),
  ];
  if (opts.sinceMs) filters.push(gt(Attr.created, opts.sinceMs));

  let q = pub
    .buildQuery()
    .where(filters)
    .withPayload(opts.withPayload ?? true)
    .withAttributes(true)
    .limit(opts.limit ?? 50);

  if (APP_WALLET_ADDRESS) q = q.createdBy(APP_WALLET_ADDRESS);

  const result = await q.fetch();
  return (result.entities as RawEntity[]).map(normalize);
}

/** Mood check-ins in the last N days. */
export function queryRecentMood(owner: string, days: number) {
  return queryByType({
    owner,
    entityType: EntityType.Mood,
    sinceMs: Date.now() - days * 86400_000,
    limit: 200,
  });
}

/** Journal entries in the last N days. */
export function queryRecentJournal(owner: string, days: number) {
  return queryByType({
    owner,
    entityType: EntityType.Journal,
    sinceMs: Date.now() - days * 86400_000,
    limit: 100,
  });
}

/** Public access log — anyone can verify what the coach read and when. */
export function queryAccessLog(owner: string, limit = 100) {
  return queryByType({ owner, entityType: EntityType.Log, limit });
}

/** Active (non-expired) grants for a user. Expiry is enforced by Arkiv itself. */
export async function queryActiveGrants(owner: string) {
  return queryByType({ owner, entityType: EntityType.Grant, limit: 20 });
}

/** Most recent subscription entity (membership concept; V1 has no real payment). */
export async function queryActiveSubscription(owner: string) {
  const subs = await queryByType({
    owner,
    entityType: EntityType.Subscription,
    limit: 5,
  });
  return subs[0] ?? null;
}
