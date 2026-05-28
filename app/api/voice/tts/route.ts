import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Luna's voice (Mariana — argentine). flash_v2_5 supports Spanish.
const VOICE_ID = "9rvdnhrYoXoUt4igKpBw";
const MODEL_ID = "eleven_flash_v2_5";

/**
 * Narrate a short text in Luna's voice via ElevenLabs TTS.
 * Used for the weekly recap. The recap text is built client-side from the
 * user's (decrypted) data — this route only turns text into audio.
 */
export async function POST(req: Request) {
  try {
    const { text } = (await req.json()) as { text?: unknown };
    if (typeof text !== "string" || !text.trim() || text.length > 2000) {
      return NextResponse.json({ error: "invalid text" }, { status: 400 });
    }

    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) {
      return NextResponse.json({ error: "tts not configured" }, { status: 500 });
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({ text, model_id: MODEL_ID }),
      },
    );

    if (!res.ok) {
      console.error("ElevenLabs TTS failed:", res.status, await res.text());
      return NextResponse.json({ error: "tts failed" }, { status: 502 });
    }

    const audio = await res.arrayBuffer();
    return new Response(audio, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("tts error:", err);
    return NextResponse.json({ error: "tts error" }, { status: 500 });
  }
}
