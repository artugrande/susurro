/**
 * End-to-end Arkiv validation against the Braga testnet.
 * Run: pnpm dlx tsx -r dotenv/config scripts/validate-arkiv.ts dotenv_config_path=.env.local
 *
 * Proves: create -> read by key -> query by attribute -> delete.
 * This de-risks the entire data layer before we build on top of it.
 */
import { jsonToPayload, ExpirationTime } from "@arkiv-network/sdk/utils";
import { eq } from "@arkiv-network/sdk/query";
import {
  getPublicClient,
  getWalletClient,
  PROJECT_ATTRIBUTE,
  EntityType,
} from "../lib/arkiv";

async function main() {
  console.log("=== Susurro · Arkiv round-trip validation (Braga) ===\n");

  const wallet = getWalletClient();
  const pub = getPublicClient();

  const testId = `validate-${Date.now()}`;
  console.log("1) Creating test entity...");
  const { entityKey, txHash } = await wallet.createEntity({
    payload: jsonToPayload({ note: "hello susurro", testId }),
    contentType: "application/json",
    attributes: [
      PROJECT_ATTRIBUTE,
      { key: "entityType", value: EntityType.Mood },
      { key: "testId", value: testId },
      { key: "value", value: 7 },
      { key: "created", value: Date.now() },
    ],
    expiresIn: ExpirationTime.fromMinutes(30),
  });
  console.log(`   entityKey: ${entityKey}`);
  console.log(`   txHash:    ${txHash}\n`);

  console.log("2) Reading entity back by key...");
  const fetched = await pub.getEntity(entityKey);
  console.log(`   payload: ${JSON.stringify(fetched.toJson())}\n`);

  console.log("3) Querying by PROJECT_ATTRIBUTE + testId...");
  const result = await pub
    .buildQuery()
    .where([
      eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
      eq("testId", testId),
    ])
    .withPayload(true)
    .withAttributes(true)
    .limit(10)
    .fetch();
  console.log(`   matches found: ${result.entities.length}\n`);

  console.log("4) Cleaning up (delete)...");
  await wallet.deleteEntity({ entityKey });
  console.log("   deleted ✓\n");

  if (result.entities.length >= 1) {
    console.log("✅ SUCCESS — Arkiv create/read/query/delete all work on Braga.");
  } else {
    console.log("⚠️  Entity created but query returned 0 — check attribute indexing.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ VALIDATION FAILED:");
  console.error(err);
  process.exit(1);
});
