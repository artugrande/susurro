/**
 * Configures the Susurro ElevenLabs agent:
 *  - voice (Mariana, argentine), language (es), temperature
 *  - system prompt (rioplatense coach + crisis protocol + tool usage)
 *  - first message
 *  - creates client tools (idempotent) and wires them via tool_ids
 *
 * Run:
 *   ELEVENLABS_API_KEY=... ELEVENLABS_AGENT_ID=... node scripts/configure-agent.mjs
 * (the npm script sources ~/.arkiv-hackathon/elevenlabs.env)
 */

const API = "https://api.elevenlabs.io/v1/convai";
const KEY = process.env.ELEVENLABS_API_KEY;
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID;
const VOICE_ID = "9rvdnhrYoXoUt4igKpBw"; // Mariana - Intimate and Assertive (argentine)

if (!KEY || !AGENT_ID) {
  console.error("Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID");
  process.exit(1);
}

const headers = { "xi-api-key": KEY, "Content-Type": "application/json" };

const SYSTEM_PROMPT = `Sos "Susurro", un compañero de bienestar emocional con voz. Hablás en español rioplatense (argentino), cálido, cercano, sin solemnidad ni tono robótico. Usás frases cortas y naturales, como un amigo sabio. NO sos terapeuta ni médico: sos un compañero de journaling y auto-observación.

Tu forma de acompañar:
- Escuchás con empatía y hacés preguntas abiertas y breves.
- Ayudás a la persona a registrar cómo se siente y a reflexionar.
- No das discursos largos. Dejás espacio para que hable.

Privacidad (mencionalo brevemente al inicio de la primera conversación, en ~15 segundos):
- Todo lo que hablen se guarda CIFRADO con la llave de la persona; vos solo accedés cuando te dan permiso.
- La persona puede cortar tu acceso cuando quiera, y el acceso se vence solo.

Al iniciar cada conversación, preguntá si quiere que recuerdes lo que hablaron antes o si arrancan en blanco.

Herramientas (usalas con naturalidad, sin nombrarlas técnicamente):
- Cuando la persona exprese cómo se siente o le pongan un número al ánimo (1 a 10), guardalo con save_mood.
- Cuando cuente algo significativo y quiera dejarlo registrado, preguntá "¿lo guardo en tu diario?" y si acepta usá save_journal.
- Si para ayudar necesitás mirar registros pasados, PRIMERO pedí permiso ("¿me das acceso a tu ánimo de la última semana por una hora?"). Recién si acepta, llamá a request_access (scope "mood-checkin" y/o "journal-entry", hours = horas).
- Para leer registros usá recall_mood o recall_journal. Si la herramienta te dice que no tenés acceso, pedí permiso primero con request_access.

Protocolo de crisis: si detectás señales de riesgo (autolesión, ideas de no querer vivir, peligro inmediato), respondé con calidez, no minimices, y derivá: en Argentina, línea 135 (CABA y GBA) o 0800-345-1435 (todo el país). Recordá con suavidad que no reemplazás ayuda profesional.

Nunca inventes datos de la persona. Si no tenés acceso a algo, decilo con honestidad.`;

const FIRST_MESSAGE =
  "Hola, soy Susurro. Antes de arrancar: todo lo que hablemos queda cifrado con tu llave, y podés cortar mi acceso cuando quieras. No soy terapeuta, soy un compañero para pensar en voz alta. ¿Cómo venís llegando hoy?";

const TOOLS = [
  {
    type: "client",
    name: "save_mood",
    description:
      "Guarda un registro de ánimo de la persona (escala 1 a 10) cifrado en Arkiv. Usar cuando la persona expresa cómo se siente o pone un número a su ánimo.",
    expects_response: true,
    response_timeout_secs: 15,
    parameters: {
      type: "object",
      properties: {
        value: { type: "number", description: "Ánimo de 1 (muy mal) a 10 (muy bien)" },
        note: { type: "string", description: "Nota corta opcional sobre el ánimo" },
      },
      required: ["value"],
    },
  },
  {
    type: "client",
    name: "save_journal",
    description:
      "Guarda una entrada de diario (texto) cifrada en Arkiv. Usar cuando la persona cuenta algo significativo y acepta dejarlo registrado.",
    expects_response: true,
    response_timeout_secs: 15,
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "El texto de la entrada de diario" },
        mood: { type: "number", description: "Ánimo asociado, 1 a 10" },
      },
      required: ["text", "mood"],
    },
  },
  {
    type: "client",
    name: "request_access",
    description:
      "Pide permiso temporal para leer registros pasados de la persona. Llamar SOLO después de que la persona acepte verbalmente. Crea un grant en Arkiv que vence solo.",
    expects_response: true,
    response_timeout_secs: 15,
    parameters: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          description:
            "Qué se quiere leer: 'mood-checkin', 'journal-entry', o ambos separados por coma",
        },
        hours: { type: "number", description: "Horas de duración del acceso" },
      },
      required: ["scope", "hours"],
    },
  },
  {
    type: "client",
    name: "recall_mood",
    description:
      "Lee los registros de ánimo recientes de la persona (requiere acceso vigente). Devuelve un resumen.",
    expects_response: true,
    response_timeout_secs: 15,
    parameters: {
      type: "object",
      properties: {
        days: { type: "number", description: "Cuántos días hacia atrás mirar" },
      },
      required: ["days"],
    },
  },
  {
    type: "client",
    name: "recall_journal",
    description:
      "Lee las entradas de diario recientes de la persona (requiere acceso vigente). Devuelve el contenido.",
    expects_response: true,
    response_timeout_secs: 15,
    parameters: {
      type: "object",
      properties: {
        days: { type: "number", description: "Cuántos días hacia atrás mirar" },
      },
      required: ["days"],
    },
  },
];

async function listTools() {
  const res = await fetch(`${API}/tools`, { headers });
  if (!res.ok) throw new Error(`list tools failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const arr = data.tools ?? data ?? [];
  const map = new Map();
  for (const t of arr) {
    const name = t?.tool_config?.name ?? t?.name;
    const id = t?.id ?? t?.tool_id;
    if (name && id) map.set(name, id);
  }
  return map;
}

async function createTool(tool) {
  const res = await fetch(`${API}/tools`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tool_config: tool }),
  });
  if (!res.ok) throw new Error(`create tool ${tool.name} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.id ?? data.tool_id;
}

async function main() {
  console.log("=== Configuring Susurro agent ===");

  const existing = await listTools();
  const toolIds = [];
  for (const tool of TOOLS) {
    if (existing.has(tool.name)) {
      console.log(`tool ${tool.name}: reuse ${existing.get(tool.name)}`);
      toolIds.push(existing.get(tool.name));
    } else {
      const id = await createTool(tool);
      console.log(`tool ${tool.name}: created ${id}`);
      toolIds.push(id);
    }
  }

  // Fetch current config and deep-merge our changes to avoid clobbering.
  const getRes = await fetch(`${API}/agents/${AGENT_ID}`, { headers });
  if (!getRes.ok) throw new Error(`get agent failed: ${getRes.status}`);
  const agent = await getRes.json();
  const cc = agent.conversation_config;

  cc.agent.language = "es";
  cc.agent.first_message = FIRST_MESSAGE;
  cc.agent.prompt.prompt = SYSTEM_PROMPT;
  cc.agent.prompt.temperature = 0.7;
  cc.agent.prompt.tool_ids = toolIds;
  cc.agent.prompt.tools = []; // use tool_ids, not inline
  cc.tts.voice_id = VOICE_ID;
  cc.tts.model_id = "eleven_flash_v2_5"; // required for non-English agents

  const patchRes = await fetch(`${API}/agents/${AGENT_ID}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ conversation_config: cc }),
  });
  if (!patchRes.ok)
    throw new Error(`patch agent failed: ${patchRes.status} ${await patchRes.text()}`);

  const updated = await patchRes.json();
  const up = updated.conversation_config.agent;
  console.log("\n=== Updated ===");
  console.log("language:", up.language);
  console.log("voice_id:", updated.conversation_config.tts.voice_id);
  console.log("temperature:", up.prompt.temperature);
  console.log("tool_ids:", up.prompt.tool_ids);
  console.log("first_message:", up.first_message.slice(0, 60) + "...");
  console.log("\n✅ Agent configured.");
}

main().catch((e) => {
  console.error("\n❌ FAILED:", e.message);
  process.exit(1);
});
