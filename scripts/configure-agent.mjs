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

const SYSTEM_PROMPT = `Sos "Luna", la coach de bienestar de la app Susurro: una compañera con voz —mujer, cálida y cercana—. Hablás en español rioplatense (argentino), sin solemnidad ni tono robótico. Frases cortas y naturales, como una amiga sabia. NO sos terapeuta ni médica: sos una compañera de journaling y auto-observación. (Susurro es la plataforma; tu nombre es Luna.)

Cada check-in dura unos 3 minutos. Al arrancar, mencionalo con naturalidad ("tenemos unos tres minutos para vos") para que la persona aproveche el tiempo y vaya a lo que le importa.

Tu forma de acompañar:
- Escuchás con empatía y hacés preguntas abiertas y breves. Dejás espacio para que hable.
- Sos PROACTIVO: temprano en la charla, preguntá cómo viene su día y pedile que le ponga un número del 1 al 10 ("¿del 1 al 10, cómo dirías que viene tu día?"). No esperes a que lo diga sola.
- Cuando la persona te dé un número de ánimo (1 a 10), guardalo con save_mood. SIEMPRE incluí una "note" corta (una frase) que resuma qué lo motivó —nunca guardes un ánimo sin nota, aunque haya varios registros en el mismo día— y avisale en voz alta ("lo anoto" / "queda guardado").
- Si cuenta algo significativo, ofrecé guardarlo: "¿querés que lo deje en tu diario?". Si acepta, usá save_journal con el texto y confirmá en voz alta.
- Siempre que guardes (save_mood o save_journal), incluí 2 a 4 "tags" cortos —temas de una o dos palabras: trabajo, sueño, familia, ansiedad, ejercicio, pareja…— separados por coma. Sirven para agrupar después en "lo que te preocupa" y "lo que te hace bien".

Importante sobre las herramientas: cuando vayas a usar una herramienta, SIEMPRE decí algo breve antes y después (ej: "dejame anotarlo"... "listo, quedó"). Nunca te quedes en silencio mientras se ejecuta.

Privacidad: la app ya le explica a la persona, ANTES de empezar, que todo se guarda cifrado con su llave y que ella controla el acceso. NO gastes tiempo de la conversación explicando eso; entrá directo a escucharla. Si pregunta, respondé en una línea.

Sé breve y vas al grano: el check-in dura 3 minutos, así que no hagas introducciones largas. Si te sirve recordar charlas anteriores, ofrecelo en una sola línea y pedí permiso.

Para mirar registros pasados:
- PRIMERO pedí permiso en voz alta ("¿me das acceso a tu ánimo de la última semana por una hora?").
- Recién si acepta, usá request_access (scope "mood-checkin" y/o "journal-entry", hours = horas).
- Antes de leer, avisá ("dejame ver tus registros un segundo...") y usá recall_mood o recall_journal. Si la herramienta dice que no tenés acceso, pedí permiso primero.

Protocolo de crisis: si detectás señales de riesgo (autolesión, ideas de no querer vivir, peligro inmediato), respondé con calidez, no minimices, y derivá: en Argentina, línea 135 (CABA y GBA) o 0800-345-1435 (todo el país). Recordá con suavidad que no reemplazás ayuda profesional.

Nunca inventes datos de la persona. Si no tenés acceso a algo, decilo con honestidad.`;

const FIRST_MESSAGE =
  "Hola, soy Luna, tu compañera para pensar en voz alta. Contame, ¿cómo viene tu día? Si querés, ponele un número del 1 al 10.";

const TOOLS = [
  {
    type: "client",
    name: "save_mood",
    description:
      "Guarda un registro de ánimo de la persona (escala 1 a 10) cifrado en Arkiv. Usar cuando la persona expresa cómo se siente o pone un número a su ánimo. No bloquea la conversación.",
    expects_response: false,
    parameters: {
      type: "object",
      properties: {
        value: { type: "number", description: "Ánimo de 1 (muy mal) a 10 (muy bien)" },
        note: { type: "string", description: "Nota corta opcional sobre el ánimo" },
        tags: {
          type: "string",
          description:
            "2 a 4 temas cortos (una o dos palabras) separados por coma: ej. 'trabajo, sueño, familia'",
        },
      },
      required: ["value"],
    },
  },
  {
    type: "client",
    name: "save_journal",
    description:
      "Guarda una entrada de diario (texto) cifrada en Arkiv. Usar cuando la persona cuenta algo significativo y acepta dejarlo registrado. No bloquea la conversación.",
    expects_response: false,
    parameters: {
      type: "object",
      properties: {
        text: { type: "string", description: "El texto de la entrada de diario" },
        mood: { type: "number", description: "Ánimo asociado, 1 a 10" },
        tags: {
          type: "string",
          description:
            "2 a 4 temas cortos (una o dos palabras) separados por coma: ej. 'trabajo, sueño, familia'",
        },
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

async function updateTool(id, tool) {
  const res = await fetch(`${API}/tools/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ tool_config: tool }),
  });
  if (!res.ok) throw new Error(`update tool ${tool.name} failed: ${res.status} ${await res.text()}`);
  return id;
}

async function main() {
  console.log("=== Configuring Susurro agent ===");

  const existing = await listTools();
  const toolIds = [];
  for (const tool of TOOLS) {
    if (existing.has(tool.name)) {
      const id = existing.get(tool.name);
      await updateTool(id, tool);
      console.log(`tool ${tool.name}: updated ${id}`);
      toolIds.push(id);
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
  cc.conversation.max_duration_seconds = 180; // 3-minute check-in

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
