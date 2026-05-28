"use client";

/**
 * The coach as an on-chain identity. In V1 this is a fixed placeholder address
 * (the coach has no real wallet yet). In V2 (Celo) this becomes a real wallet
 * with an ERC-8004 identity and reputation. Grants name this address as the
 * grantee, and the access-log records reads under it.
 */
import { queryActiveGrants, type QueriedEntity } from "@/lib/entities";

export const COACH_ADDRESS = "0xc0ac00000000000000000000000000000000c0ac";

/**
 * Find a non-expired grant from the user to the coach that covers `scope`.
 * Arkiv auto-expires grants, so any returned grant is still valid.
 */
export async function findActiveGrant(
  owner: string,
  scope: string,
): Promise<QueriedEntity | null> {
  const grants = await queryActiveGrants(owner);
  for (const g of grants) {
    const grantee = String(g.attributes.grantee ?? "").toLowerCase();
    if (grantee !== COACH_ADDRESS.toLowerCase()) continue;
    const scopes = String(g.attributes.scope ?? "").split(",");
    if (scopes.includes(scope)) return g;
  }
  return null;
}
