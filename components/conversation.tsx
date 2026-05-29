"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { useSession } from "@/lib/session";
import { Mic } from "lucide-react";
import { PresenceBlob } from "@/components/presence-blob";
import {
  saveMoodCheckin,
  saveJournalEntry,
  createGrant,
  writeAccessLog,
} from "@/lib/write";
import { getDecryptedMood, getDecryptedJournal } from "@/lib/read";
import { COACH_ADDRESS, findActiveGrant } from "@/lib/coach";
import type { EntityScope } from "@/lib/entities";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID as string;
const MAX_SECONDS = 180; // 3-minute check-in

type ToolParams = Record<string, unknown>;

export function Conversation() {
  const { address, encryptionKey, isUnlocked } = useSession();
  const [sessionId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const [lastTool, setLastTool] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<
    { id: number; role: "user" | "ai"; text: string }[]
  >([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(0);

  const conversation = useConversation({
    onError: (e: unknown) => setError(String(e)),
    onMessage: (props: { message?: string; source?: string }) => {
      const text = props?.message;
      if (!text) return;
      const role: "user" | "ai" = props.source === "user" ? "user" : "ai";
      setTranscript((t) => [...t, { id: msgIdRef.current++, role, text }]);
    },
  });

  const status = conversation.status;
  const isConnected = status === "connected";
  const isSpeaking = conversation.isSpeaking;

  // Debounce speaking -> listening so the label/orb don't flicker during the
  // tiny pauses Luna takes mid-sentence. Switch to speaking instantly; only
  // drop back to listening after ~1.2s of continuous silence.
  const [stableSpeaking, setStableSpeaking] = useState(false);
  useEffect(() => {
    if (isSpeaking) {
      setStableSpeaking(true);
      return;
    }
    const t = setTimeout(() => setStableSpeaking(false), 1200);
    return () => clearTimeout(t);
  }, [isSpeaking]);

  const orbState: "idle" | "listening" | "speaking" = !isConnected
    ? "idle"
    : stableSpeaking
      ? "speaking"
      : "listening";

  // 3-minute countdown; auto-ends the session once at zero.
  const [remaining, setRemaining] = useState(MAX_SECONDS);
  const startedAtRef = useRef(0);
  const endedRef = useRef(false);
  useEffect(() => {
    if (!isConnected) return;
    endedRef.current = false;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      const left = Math.max(0, MAX_SECONDS - elapsed);
      setRemaining(left);
      if (left <= 0 && !endedRef.current) {
        endedRef.current = true;
        try {
          conversation.endSession();
        } catch {
          /* ignore */
        }
        clearInterval(id);
      }
    }, 250);
    return () => clearInterval(id);
  }, [isConnected, conversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const buildClientTools = useCallback(() => {
    const owner = address as string;
    const key = encryptionKey as CryptoKey;

    const note = (name: string) => setLastTool(name);

    // Wrap every tool so a transient write error never throws back to the
    // agent (which would surface a scary "Client tool execution failed" banner
    // and disrupt the session). It logs, stays graceful, and the chat continues.
    const run =
      (name: string, fn: (p: ToolParams) => Promise<string>) =>
      async (p: ToolParams): Promise<string> => {
        note(name);
        try {
          return await fn(p);
        } catch (e) {
          console.error(`tool ${name} failed:`, e);
          return "Tuve un problema técnico al guardar eso, pero seguimos hablando.";
        }
      };

    return {
      save_mood: run("guardando ánimo", async (p) => {
        await saveMoodCheckin({
          owner,
          value: Number(p.value),
          note: typeof p.note === "string" ? p.note : undefined,
          tags: typeof p.tags === "string" ? p.tags : undefined,
          key,
        });
        return "Listo, guardé tu registro de ánimo cifrado en Arkiv.";
      }),
      save_journal: run("guardando en el diario", async (p) => {
        await saveJournalEntry({
          owner,
          text: String(p.text ?? ""),
          mood: Number(p.mood ?? 5),
          tags: typeof p.tags === "string" ? p.tags : undefined,
          sessionId,
          key,
        });
        return "Guardé esa entrada en tu diario, cifrada.";
      }),
      request_access: run("pidiendo acceso", async (p) => {
        const scopes = String(p.scope ?? "mood-checkin")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean) as EntityScope[];
        const hours = Math.max(1, Number(p.hours ?? 1));
        await createGrant({
          owner,
          grantee: COACH_ADDRESS,
          scope: scopes,
          durationSeconds: hours * 3600,
        });
        return `Acceso otorgado por ${hours} hora(s) a: ${scopes.join(", ")}.`;
      }),
      recall_mood: run("consultando ánimo", async (p) => {
        const grant = await findActiveGrant(owner, "mood-checkin");
        if (!grant)
          return "No tengo acceso a tus registros de ánimo. Pedile permiso al usuario con request_access.";
        const days = Number(p.days ?? 7) || 7;
        const moods = await getDecryptedMood(owner, days, key);
        await writeAccessLog({
          owner,
          grantee: COACH_ADDRESS,
          action: "recall_mood",
          description: `leyó ${moods.length} registros de ánimo de ${days} días`,
          entitiesRead: [],
          sessionId,
        });
        if (!moods.length) return "No hay registros de ánimo en ese período.";
        const avg = (
          moods.reduce((a, m) => a + m.value, 0) / moods.length
        ).toFixed(1);
        const detail = moods
          .slice(0, 6)
          .map((m) => `${m.value}/10${m.note ? ` (${m.note})` : ""}`)
          .join("; ");
        return `${moods.length} registros, promedio ${avg}/10. ${detail}`;
      }),
      recall_journal: run("consultando diario", async (p) => {
        const grant = await findActiveGrant(owner, "journal-entry");
        if (!grant)
          return "No tengo acceso a tu diario. Pedile permiso al usuario con request_access.";
        const days = Number(p.days ?? 14) || 14;
        const entries = await getDecryptedJournal(owner, days, key);
        await writeAccessLog({
          owner,
          grantee: COACH_ADDRESS,
          action: "recall_journal",
          description: `leyó ${entries.length} entradas de diario`,
          entitiesRead: [],
          sessionId,
        });
        if (!entries.length) return "No hay entradas de diario en ese período.";
        return entries
          .slice(0, 5)
          .map((j) => `(${j.mood}/10) ${j.text}`)
          .join(" || ");
      }),
    };
  }, [address, encryptionKey, sessionId]);

  const start = useCallback(() => {
    setError(null);
    setTranscript([]);
    startedAtRef.current = Date.now();
    setRemaining(MAX_SECONDS);
    try {
      conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
        clientTools: buildClientTools(),
      });
    } catch (e) {
      setError(String(e));
    }
  }, [conversation, buildClientTools]);

  const stop = useCallback(() => {
    endedRef.current = true;
    try {
      conversation.endSession();
    } catch {
      /* ignore */
    }
    setLastTool(null);
  }, [conversation]);

  if (!isUnlocked) return null;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex h-60 w-60 items-center justify-center">
        {isConnected && (
          <svg
            viewBox="0 0 240 240"
            className="pointer-events-none absolute inset-0 -rotate-90"
          >
            <circle
              cx="120"
              cy="120"
              r="112"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
            />
            <circle
              cx="120"
              cy="120"
              r="112"
              fill="none"
              stroke="#cbb99d"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 112}
              strokeDashoffset={2 * Math.PI * 112 * (1 - remaining / MAX_SECONDS)}
              className="transition-[stroke-dashoffset] duration-300"
            />
          </svg>
        )}
        <PresenceBlob state={orbState} className="h-48 w-48" />
        {!isConnected && (
          <button
            onClick={start}
            aria-label="Empezar a hablar con Luna"
            className="absolute inset-0 rounded-full"
          />
        )}
      </div>

      <p className="text-sm text-muted">
        {!isConnected
          ? "Tocá la esfera para empezar tu check-in de 3 minutos"
          : stableSpeaking
            ? "Luna está hablando…"
            : "Luna te escucha…"}
      </p>

      {isConnected && (
        <p className="font-mono text-xs text-sand">
          {Math.floor(remaining / 60)}:
          {String(remaining % 60).padStart(2, "0")} restantes
        </p>
      )}

      {lastTool && isConnected && (
        <span className="rounded-full border border-sand/25 px-3 py-1 text-xs text-sand">
          🔒 {lastTool} · Arkiv
        </span>
      )}

      {isConnected && transcript.length > 0 && (
        <div
          ref={scrollRef}
          className="max-h-44 w-full max-w-md space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-left"
        >
          {transcript.slice(-8).map((m) => (
            <div key={m.id} className="animate-[fadeInUp_0.4s_ease-out]">
              <span className="text-[0.6rem] uppercase tracking-wider text-muted">
                {m.role === "user" ? "vos" : "susurro"}
              </span>
              <p
                className={
                  m.role === "user"
                    ? "text-sm text-foreground/90"
                    : "text-sm text-sand"
                }
              >
                {m.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {!isConnected ? (
        <button
          onClick={start}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-sand px-7 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-sand/90"
        >
          <Mic className="h-4 w-4" />
          Hablar con Luna
        </button>
      ) : (
        <button
          onClick={stop}
          className="inline-flex items-center justify-center rounded-full border border-sand/30 px-7 py-3 text-sm text-sand transition-colors hover:bg-sand/10"
        >
          Terminar conversación
        </button>
      )}

      {error && <p className="max-w-sm text-xs text-red-400">{error}</p>}
    </div>
  );
}
