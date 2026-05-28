import { NextResponse } from "next/server";
import { getWalletClient } from "@/lib/arkiv";
import { queryActiveGrants } from "@/lib/entities";

export const runtime = "nodejs";

interface DeleteBody {
  entityKey?: unknown;
  owner?: unknown;
}

/**
 * Revoke (delete) an access-grant. To prevent anyone from deleting arbitrary
 * entities, we only allow deleting a grant that actually belongs to the
 * claimed owner (verified by querying the owner's active grants first).
 */
export async function POST(req: Request) {
  try {
    const { entityKey, owner } = (await req.json()) as DeleteBody;
    if (typeof entityKey !== "string" || typeof owner !== "string") {
      return NextResponse.json(
        { error: "entityKey and owner required" },
        { status: 400 },
      );
    }

    const grants = await queryActiveGrants(owner);
    const found = grants.find((g) => g.entityKey === entityKey);
    if (!found) {
      return NextResponse.json(
        { error: "grant not found for this owner" },
        { status: 404 },
      );
    }

    const wallet = getWalletClient();
    await wallet.deleteEntity({ entityKey: entityKey as `0x${string}` });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete entity failed:", err);
    return NextResponse.json({ error: "delete failed" }, { status: 500 });
  }
}
