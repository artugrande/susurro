/**
 * Enables runtime overrides on the Susurro ElevenLabs agent for:
 *   - agent.language
 *   - agent.prompt.prompt
 *   - agent.first_message
 *
 * Without this, the `overrides` passed to `useConversation.startSession()`
 * are silently ignored by ElevenLabs (security feature — overrides have to
 * be explicitly allowed per field). With this, the language switcher in the
 * Susurro UI can flip Luna between ES and EN at conversation start.
 *
 * Run:
 *   ELEVENLABS_API_KEY=... ELEVENLABS_AGENT_ID=... node scripts/enable-agent-overrides.mjs
 */

const API = "https://api.elevenlabs.io/v1/convai";
const KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

if (!KEY || !AGENT_ID) {
  console.error("Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID");
  process.exit(1);
}

const headers = { "xi-api-key": KEY, "Content-Type": "application/json" };

async function main() {
  console.log("=== Enabling runtime overrides on Susurro agent ===");

  // Pull current config and deep-merge our changes so we don't clobber
  // existing settings.
  const getRes = await fetch(`${API}/agents/${AGENT_ID}`, { headers });
  if (!getRes.ok) {
    throw new Error(`get agent failed: ${getRes.status} ${await getRes.text()}`);
  }
  const agent = await getRes.json();

  const platform = agent.platform_settings ?? {};
  const overrides = platform.overrides ?? {};
  const ccOverride = overrides.conversation_config_override ?? {};
  const agentOverride = ccOverride.agent ?? {};

  // Allow these three runtime override slots — Susurro flips them per locale
  // at startSession.
  agentOverride.prompt = { prompt: true };
  agentOverride.first_message = true;
  agentOverride.language = true;

  const patchBody = {
    platform_settings: {
      ...platform,
      overrides: {
        ...overrides,
        conversation_config_override: {
          ...ccOverride,
          agent: agentOverride,
        },
      },
    },
  };

  const patchRes = await fetch(`${API}/agents/${AGENT_ID}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(patchBody),
  });
  if (!patchRes.ok) {
    throw new Error(
      `patch agent failed: ${patchRes.status} ${await patchRes.text()}`,
    );
  }

  const updated = await patchRes.json();
  const got =
    updated.platform_settings?.overrides?.conversation_config_override
      ?.agent ?? {};
  console.log("\n=== Override flags now ===");
  console.log("agent.language        :", got.language);
  console.log("agent.first_message   :", got.first_message);
  console.log("agent.prompt          :", JSON.stringify(got.prompt));
  console.log("\n✅ Overrides enabled.");
}

main().catch((e) => {
  console.error("\n❌ FAILED:", e.message);
  process.exit(1);
});
