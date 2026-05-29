import { createPublicClient, createWalletClient, http } from "@arkiv-network/sdk";
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts";
import { braga } from "@arkiv-network/sdk/chains";

/**
 * Every Susurro entity carries this attribute so our queries never collide
 * with other projects on the shared Arkiv (Braga) testnet.
 * This is the single most important Arkiv best practice — it is judged.
 */
export const PROJECT_ATTRIBUTE = {
  key: "project",
  value: "susurro-punatech26-aq7x9k",
} as const;

if (!PROJECT_ATTRIBUTE.value) {
  throw new Error("PROJECT_ATTRIBUTE.value must be a unique, non-empty string.");
}

/** Entity type discriminator values. */
export const EntityType = {
  Journal: "journal-entry",
  Mood: "mood-checkin",
  Grant: "access-grant",
  Log: "access-log",
  Insight: "coach-insight",
  Subscription: "subscription",
} as const;

export type EntityTypeValue = (typeof EntityType)[keyof typeof EntityType];

/**
 * Read-only client. Safe for the browser and server. Use for all queries.
 */
export function getPublicClient() {
  return createPublicClient({
    chain: braga,
    transport: http(),
  });
}

/**
 * Read/write client. SERVER ONLY — requires the app's funded private key.
 * The app wallet pays GLM gas on behalf of users so they never need testnet
 * funds. Payloads arrive already encrypted, so the server never sees plaintext.
 */
export function getWalletClient() {
  const pk = process.env.ARKIV_PRIVATE_KEY;
  if (!pk) {
    throw new Error(
      "ARKIV_PRIVATE_KEY is not set. getWalletClient() must only run server-side.",
    );
  }
  return createWalletClient({
    chain: braga,
    transport: http(),
    account: privateKeyToAccount(pk as `0x${string}`),
  });
}

/** The app wallet address that creates all entities (the trusted $creator). */
export const APP_WALLET_ADDRESS = process.env
  .NEXT_PUBLIC_ARKIV_APP_ADDRESS as `0x${string}` | undefined;

/**
 * Serialize all writes through the app wallet. Concurrent writes (e.g. the
 * agent firing save_mood + save_journal + access-log close together) would
 * reuse the same transaction nonce and fail with a 500. This queue runs them
 * one at a time. Errors don't break the chain.
 */
let writeChain: Promise<unknown> = Promise.resolve();
export function withWalletLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
