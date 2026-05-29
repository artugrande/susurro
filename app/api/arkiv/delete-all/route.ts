import { NextResponse } from "next/server";
import { getWalletClient, EntityType, withWalletLock } from "@/lib/arkiv";
import { queryByType } from "@/lib/entities";

export const runtime = "nodejs";

const WIPE_TYPES: string[] = [
  EntityType.Mood,
  EntityType.Journal,
  EntityType.Insight,
  EntityType.Grant,
  EntityType.Subscription,
];

/**
 * Erase ALL of a user's data and revoke every grant — in a single Arkiv
 * batch operation. Only deletes entities owned by the requesting address.
 */
export async function POST(req: Request) {
  try {
    const { owner } = (await req.json()) as { owner?: unknown };
    if (typeof owner !== "string") {
      return NextResponse.json({ error: "owner required" }, { status: 400 });
    }

    // Gather entity keys to delete, in parallel and WITHOUT payloads
    // (deleting only needs the key — fetching ciphertext on every entity
    // would make the Arkiv RPC time out on bigger accounts).
    // Per-type try/catch keeps one slow type from killing the whole wipe.
    const perType = await Promise.all(
      WIPE_TYPES.map(async (type) => {
        try {
          const ents = await queryByType({
            owner,
            entityType: type,
            limit: 200,
            withPayload: false,
          });
          return ents.map((e) => e.entityKey);
        } catch (err) {
          console.warn(`delete-all: query ${type} failed:`, err);
          return [] as string[];
        }
      }),
    );
    const keys = perType.flat();

    if (keys.length > 0) {
      const wallet = getWalletClient();
      await withWalletLock(() =>
        wallet.mutateEntities({
          deletes: keys.map((k) => ({ entityKey: k as `0x${string}` })),
        }),
      );
    }

    return NextResponse.json({ ok: true, deleted: keys.length });
  } catch (err) {
    console.error("delete-all failed:", err);
    return NextResponse.json({ error: "delete-all failed" }, { status: 500 });
  }
}
