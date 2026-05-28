/**
 * Demo mode: lets anyone explore a pre-populated account (a developer in
 * Salta) without connecting a wallet. The data is encrypted with a fixed,
 * public demo key — fine because it's fictional, and it lets the dashboard
 * (streak, timeline, threads, recap) show real on-chain data instantly.
 */
export const DEMO_OWNER = "demo-salta-dev";

// Fixed seed used to derive the demo AES key (NOT a real wallet signature).
export const DEMO_KEY_SEED = "0x" + "5a17ade5".repeat(16);
