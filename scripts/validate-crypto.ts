/**
 * Validate the encryption round-trip and key determinism.
 * Run: pnpm dlx tsx scripts/validate-crypto.ts
 */
import { deriveEncryptionKey, encryptJSON, decryptJSON } from "../lib/crypto";

async function main() {
  console.log("=== Susurro · crypto round-trip ===\n");

  // A deterministic fake signature (in the app this comes from personal_sign).
  const sig =
    "0x" +
    "a1b2c3d4e5f6071829aabbccddeeff00112233445566778899aabbccddeeff00" +
    "112233445566778899aabbccddeeff00a1b2c3d4e5f6071829aabbccddeeff00" +
    "1b";

  const key1 = await deriveEncryptionKey(sig);
  const key2 = await deriveEncryptionKey(sig); // same sig -> usable interchangeably

  const secret = { text: "hoy me sentí enroscada con el laburo", mood: 4 };
  console.log("plaintext:", JSON.stringify(secret));

  const ct = await encryptJSON(secret, key1);
  console.log("ciphertext (base64):", ct.slice(0, 48) + "...");

  const back = await decryptJSON<typeof secret>(ct, key2);
  console.log("decrypted:", JSON.stringify(back));

  const ok = back.text === secret.text && back.mood === secret.mood;

  // Wrong key must fail.
  const wrongSig = "0x" + "00".repeat(64) + "1b";
  const wrongKey = await deriveEncryptionKey(wrongSig);
  let wrongFailed = false;
  try {
    await decryptJSON(ct, wrongKey);
  } catch {
    wrongFailed = true;
  }

  console.log("\nround-trip ok:", ok);
  console.log("wrong key rejected:", wrongFailed);
  if (ok && wrongFailed) {
    console.log("\n✅ SUCCESS — encryption works and is key-bound.");
  } else {
    console.log("\n❌ FAILED");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
