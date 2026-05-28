"use client";

import { useCallback, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { useSession } from "@/lib/session";
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

type ToolParams = Record<string, unknown>;

export function Conversation() {
  const { address, encryptionKey, isUnlocked } = useSession();
  const [sessionId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const [lastTool, setLastTool] = useState<string | null>(null);

  const conversation = useConversation({
    onError: (e: unknown) => setError(String(e)),
  });

  const status = conversation.status;
  const isConnected = status === "connected";
  const isSpeaking = conversation.isSpeaking;

  const buildClientTools = useCallback(() => {
    const owner = address as string;
    const key = encryptionKey as CryptoKey;

    const note = (name: string) => setLastTool(name);

    return {
      save_mood: async (p: ToolParams) => {
        note("guardando ánimo");
        await saveMoodCheckin({
          owner,
          value: Number(p.value),
          note: typeof p.note === "string" ? p.note : undefined,
          key,
        });
        return "Listo, guardé tu registro de ánimo cifrado en Arkiv.";
      },
      save_journal: async (p: ToolParams) => {
        note("guardando en el diario");
        await saveJournalEntry({
          owner,
          text: String(p.text ?? ""),
          mood: Number(p.mood ?? 5),
          sessionId,
          key,
        });
        return "Guardé esa entrada en tu diario, cifrada.";
      },
      request_access: async (p: ToolParams) => {
        note("pidiendo acceso");
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
      },
      recall_mood: async (p: ToolParams) => {
        note("consultando ánimo");
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
      },
      recall_journal: async (p: ToolParams) => {
        note("consultando diario");
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
      },
    };
  }, [address, encryptionKey, sessionId]);

  const start = useCallback(() => {
    setError(null);
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
    conversation.endSession();
    setLastTool(null);
  }, [conversation]);

  if (!isUnlocked) return null;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* breathing orb */}
      <div
        className={[
          "relative flex h-36 w-36 items-center justify-center rounded-full",
          "bg-[radial-gradient(circle,_rgba(203,185,157,0.35),_rgba(203,185,157,0.05))]",
          isConnected ? "animate-pulse" : "",
        ].join(" ")}
      >
        <div
          className={[
            "h-20 w-20 rounded-full bg-sand/80 transition-transform duration-300",
            isSpeaking ? "scale-110" : "scale-100",
          ].join(" ")}
        />
      </div>

      <p className="text-sm text-muted">
        {!isConnected
          ? "Tocá para empezar a hablar"
          : isSpeaking
            ? "Susurro está hablando…"
            : "Te escucho…"}
      </p>

      {lastTool && isConnected && (
        <span className="rounded-full border border-sand/25 px-3 py-1 text-xs text-sand">
          🔒 {lastTool} · Arkiv
        </span>
      )}

      {!isConnected ? (
        <button
          onClick={start}
          className="inline-flex items-center justify-center rounded-full bg-sand px-7 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-sand/90"
        >
          🎙️ Hablar con Susurro
        </button>
      ) : (
        <button
          onClick={stop}
          className="inline-flex items-center justify-center rounded-full border border-sand/30 px-7 py-3 text-sm text-sand transition-colors hover:bg-sand/10"
        >
          Terminar
        </button>
      )}

      {error && <p className="max-w-sm text-xs text-red-400">{error}</p>}
    </div>
  );
}
