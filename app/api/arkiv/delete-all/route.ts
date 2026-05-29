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

    const keys: string[] = [];
    for (const type of WIPE_TYPES) {
      const ents = await queryByType({ owner, entityType: type, limit: 1000 });
      keys.push(...ents.map((e) => e.entityKey));
    }

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
