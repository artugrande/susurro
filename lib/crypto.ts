/**
 * Client-side encryption for Susurro.
 *
 * Model: the user signs a fixed message once; the (deterministic) signature is
 * the seed for an AES-256-GCM key via HKDF. That key never leaves the browser.
 * Payloads are encrypted before they are sent to our API, so neither our server
 * nor the public Arkiv ledger ever sees plaintext. Only someone holding the
 * wallet-derived key can decrypt.
 *
 * Isomorphic: uses Web Crypto (globalThis.crypto.subtle), available in modern
 * browsers and Node 20+.
 */

/** Fixed message the user signs to derive their encryption key. */
export const KEY_DERIVATION_MESSAGE =
  "Susurro · Derivar mi llave de cifrado personal (v1). Firmá solo en susurro.app.";

const SALT = new TextEncoder().encode("susurro-hkdf-salt-v1");
const INFO = new TextEncoder().encode("susurro-aes-gcm-256-v1");
const IV_BYTES = 12;

function getSubtle(): SubtleCrypto {
  const c = globalThis.crypto;
  if (!c?.subtle) throw new Error("Web Crypto API unavailable in this runtime.");
  return c.subtle;
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Derive a non-extractable AES-256-GCM key from a wallet signature.
 * The signature must be deterministic for the same (wallet, message) pair —
 * EIP-191 personal_sign with RFC 6979 ECDSA satisfies this.
 */
export async function deriveEncryptionKey(
  signatureHex: string,
): Promise<CryptoKey> {
  const subtle = getSubtle();
  const material = hexToBytes(signatureHex);
  const baseKey = await subtle.importKey(
    "raw",
    material as BufferSource,
    "HKDF",
    false,
    ["deriveKey"],
  );
  return subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: SALT as BufferSource,
      info: INFO as BufferSource,
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt a JSON-serializable value. Returns base64 of (IV || ciphertext).
 */
export async function encryptJSON(
  data: unknown,
  key: CryptoKey,
): Promise<string> {
  const subtle = getSubtle();
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const cipher = new Uint8Array(
    await subtle.encrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      plaintext as BufferSource,
    ),
  );
  const out = new Uint8Array(iv.length + cipher.length);
  out.set(iv, 0);
  out.set(cipher, iv.length);
  return bytesToBase64(out);
}

/**
 * Decrypt base64 of (IV || ciphertext) back into the original value.
 */
export async function decryptJSON<T = unknown>(
  ciphertextB64: string,
  key: CryptoKey,
): Promise<T> {
  const subtle = getSubtle();
  const raw = base64ToBytes(ciphertextB64);
  const iv = raw.slice(0, IV_BYTES);
  const cipher = raw.slice(IV_BYTES);
  const plain = await subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    cipher as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}
