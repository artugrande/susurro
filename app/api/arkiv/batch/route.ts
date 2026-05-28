import { NextResponse } from "next/server";
import { jsonToPayload } from "@arkiv-network/sdk/utils";
import { getWalletClient, PROJECT_ATTRIBUTE } from "@/lib/arkiv";
import { ALLOWED_ENTITY_TYPES } from "@/lib/entities";

export const runtime = "nodejs";

const MIN_EXPIRY = 60;
const MAX_EXPIRY = 400 * 24 * 3600;
const MAX_ITEMS = 50;

interface Item {
  entityType?: unknown;
  attributes?: unknown;
  payload?: unknown;
  expiresIn?: unknown;
}

/**
 * Batch-create entities in a single Arkiv operation (used for demo seeding).
 * The app wallet signs once. Payloads arrive already encrypted.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { items?: Item[] };
    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items required" }, { status: 400 });
    }
    if (items.length > MAX_ITEMS) {
      return NextResponse.json({ error: "too many items" }, { status: 400 });
    }

    const creates = items.map((it) => {
      if (
        typeof it.entityType !== "string" ||
        !ALLOWED_ENTITY_TYPES.includes(it.entityType)
      ) {
        throw new Error("invalid entityType");
      }
      if (!Array.isArray(it.attributes)) throw new Error("invalid attributes");
      const hasProject = it.attributes.some(
        (a) =>
          a?.key === PROJECT_ATTRIBUTE.key &&
          a?.value === PROJECT_ATTRIBUTE.value,
      );
      if (!hasProject) throw new Error("missing PROJECT_ATTRIBUTE");
      const exp = Number(it.expiresIn);
      if (!Number.isFinite(exp) || exp < MIN_EXPIRY || exp > MAX_EXPIRY) {
        throw new Error("invalid expiresIn");
      }
      return {
        payload: jsonToPayload(it.payload ?? {}),
        contentType: "application/json",
        attributes: it.attributes as { key: string; value: string | number }[],
        expiresIn: exp,
      };
    });

    const wallet = getWalletClient();
    const result = (await wallet.mutateEntities({ creates })) as {
      txHash?: string;
    };

    return NextResponse.json({
      ok: true,
      count: creates.length,
      txHash: result?.txHash,
    });
  } catch (err) {
    console.error("batch create failed:", err);
    const message = err instanceof Error ? err.message : "batch failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
