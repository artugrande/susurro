import { NextResponse } from "next/server";
import { jsonToPayload } from "@arkiv-network/sdk/utils";
import { getWalletClient, PROJECT_ATTRIBUTE, withWalletLock } from "@/lib/arkiv";
import { ALLOWED_ENTITY_TYPES } from "@/lib/entities";

// Needs the private key + SDK — must run on Node, not the edge runtime.
export const runtime = "nodejs";

const MIN_EXPIRY = 60; // 1 minute
const MAX_EXPIRY = 400 * 24 * 3600; // ~400 days

interface CreateBody {
  entityType?: unknown;
  attributes?: unknown;
  payload?: unknown;
  expiresIn?: unknown;
}

/**
 * Create an Arkiv entity on behalf of a user.
 * The app wallet signs and pays GLM gas. Payloads arrive already encrypted
 * (for sensitive types), so this server never sees plaintext.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBody;
    const { entityType, attributes, payload, expiresIn } = body;

    if (
      typeof entityType !== "string" ||
      !ALLOWED_ENTITY_TYPES.includes(entityType)
    ) {
      return NextResponse.json({ error: "invalid entityType" }, { status: 400 });
    }
    if (!Array.isArray(attributes)) {
      return NextResponse.json(
        { error: "attributes must be an array" },
        { status: 400 },
      );
    }
    const hasProject = attributes.some(
      (a) =>
        a?.key === PROJECT_ATTRIBUTE.key && a?.value === PROJECT_ATTRIBUTE.value,
    );
    if (!hasProject) {
      return NextResponse.json(
        { error: "missing PROJECT_ATTRIBUTE" },
        { status: 400 },
      );
    }
    const exp = Number(expiresIn);
    if (!Number.isFinite(exp) || exp < MIN_EXPIRY || exp > MAX_EXPIRY) {
      return NextResponse.json({ error: "invalid expiresIn" }, { status: 400 });
    }

    const wallet = getWalletClient();
    const { entityKey, txHash } = await withWalletLock(() =>
      wallet.createEntity({
        payload: jsonToPayload(payload ?? {}),
        contentType: "application/json",
        attributes: attributes as { key: string; value: string | number }[],
        expiresIn: exp,
      }),
    );

    return NextResponse.json({ entityKey, txHash });
  } catch (err) {
    console.error("create entity failed:", err);
    return NextResponse.json({ error: "create failed" }, { status: 500 });
  }
}
