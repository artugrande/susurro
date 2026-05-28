/**
 * Validate the entity model read-path against Braga using real SDK calls.
 * Run: pnpm dlx tsx -r dotenv/config scripts/validate-entities.ts dotenv_config_path=.env.local
 */
import { jsonToPayload, stringToPayload } from "@arkiv-network/sdk/utils";
import { getWalletClient, APP_WALLET_ADDRESS, EntityType } from "../lib/arkiv";
import {
  buildMoodAttributes,
  buildAccessLogAttributes,
  queryRecentMood,
  queryAccessLog,
  Expiry,
} from "../lib/entities";

async function main() {
  console.log("=== Susurro · entity model validation (Braga) ===\n");
  const owner = (APP_WALLET_ADDRESS as string).toLowerCase();
  const wallet = getWalletClient();
  const created: string[] = [];

  console.log("1) Creating a mood-checkin (value=3)...");
  const mood = await wallet.createEntity({
    payload: jsonToPayload({ note: "test mood" }),
    contentType: "application/json",
    attributes: buildMoodAttributes({ owner, value: 3 }),
    expiresIn: Expiry.mood(),
  });
  created.push(mood.entityKey);
  console.log(`   ${mood.entityKey}\n`);

  console.log("2) Creating an access-log (public)...");
  const log = await wallet.createEntity({
    payload: stringToPayload(
      JSON.stringify({ action: "query-mood", entitiesRead: [mood.entityKey], description: "test" }),
    ),
    contentType: "application/json",
    attributes: buildAccessLogAttributes({
      owner,
      grantee: "0x000000000000000000000000000000000000c0ac",
      action: "query-mood",
    }),
    expiresIn: Expiry.log(),
  });
  created.push(log.entityKey);
  console.log(`   ${log.entityKey}\n`);

  console.log("3) queryRecentMood(owner, 1 day)...");
  const moods = await queryRecentMood(owner, 1);
  console.log(`   moods found: ${moods.length}`);

  console.log("4) queryAccessLog(owner)...");
  const logs = await queryAccessLog(owner, 50);
  console.log(`   logs found: ${logs.length}\n`);

  console.log("5) Cleanup...");
  for (const key of created) await wallet.deleteEntity({ entityKey: key });
  console.log(`   deleted ${created.length} entities ✓\n`);

  if (moods.length >= 1 && logs.length >= 1) {
    console.log("✅ SUCCESS — entity builders + trusted query path work on Braga.");
  } else {
    console.log("❌ FAILED — query returned fewer than expected.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("\n❌ ENTITY VALIDATION FAILED:");
  console.error(e);
  process.exit(1);
});
