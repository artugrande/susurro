import { NextResponse } from "next/server";
import { getWalletClient, withWalletLock } from "@/lib/arkiv";
import { queryByType, ALLOWED_ENTITY_TYPES } from "@/lib/entities";

export const runtime = "nodejs";

interface DeleteBody {
  entityKey?: unknown;
  owner?: unknown;
  entityType?: unknown;
}

/**
 * Delete one entity (a grant to revoke, or a mood/journal entry to erase).
 * We verify the entity actually belongs to the claimed owner before deleting,
 * so no one can delete another user's data through this endpoint.
 */
export async function POST(req: Request) {
  try {
    const { entityKey, owner, entityType } = (await req.json()) as DeleteBody;
    if (
      typeof entityKey !== "string" ||
      typeof owner !== "string" ||
      typeof entityType !== "string" ||
      !ALLOWED_ENTITY_TYPES.includes(entityType)
    ) {
      return NextResponse.json(
        { error: "entityKey, owner and valid entityType required" },
        { status: 400 },
      );
    }

    const owned = await queryByType({ owner, entityType, limit: 1000 });
    if (!owned.find((e) => e.entityKey === entityKey)) {
      return NextResponse.json(
        { error: "entity not found for this owner" },
        { status: 404 },
      );
    }

    const wallet = getWalletClient();
    await withWalletLock(() =>
      wallet.deleteEntity({ entityKey: entityKey as `0x${string}` }),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete entity failed:", err);
    return NextResponse.json({ error: "delete failed" }, { status: 500 });
  }
}
