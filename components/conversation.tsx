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
import { useT, useLocale } from "@/lib/i18n";
import { LUNA_AGENT_OVERRIDE } from "@/lib/luna-prompt";
import type { EntityScope } from "@/lib/entities";

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID as string;
const MAX_SECONDS = 180; // 3-minute check-in

type ToolParams = Record<string, unknown>;

export function Conversation() {
  const t = useT();
  const locale = useLocale();
  const { address, encryptionKey, isUnlocked } = useSession();
  const [sessionId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const [lastTool, setLastTool] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeSeen, setWelcomeSeen] = useState(false);
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
      setTranscript((tr) => [...tr, { id: msgIdRef.current++, role, text }]);
    },
  });

  const status = conversation.status;
  const isConnected = status === "connected";
  const isSpeaking = conversation.isSpeaking;

  const [stableSpeaking, setStableSpeaking] = useState(false);
  useEffect(() => {
    if (isSpeaking) {
      setStableSpeaking(true);
      return;
    }
    const tid = setTimeout(() => setStableSpeaking(false), 1200);
    return () => clearTimeout(tid);
  }, [isSpeaking]);

  const orbState: "idle" | "listening" | "speaking" = !isConnected
    ? "idle"
    : stableSpeaking
      ? "speaking"
      : "listening";

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
    if (isConnected) setStarting(false);
  }, [isConnected]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const buildClientTools = useCallback(() => {
    const owner = address as string;
    const key = encryptionKey as CryptoKey;

    const note = (name: string) => setLastTool(name);

    const run =
      (name: string, fn: (p: ToolParams) => Promise<string>) =>
      async (p: ToolParams): Promise<string> => {
        note(name);
        try {
          return await fn(p);
        } catch (e) {
          console.error(`tool ${name} failed:`, e);
          return t("conv.toolError");
        }
      };

    return {
      save_mood: run(t("conv.toolNoteSavingMood"), async (p) => {
        await saveMoodCheckin({
          owner,
          value: Number(p.value),
          note: typeof p.note === "string" ? p.note : undefined,
          tags: typeof p.tags === "string" ? p.tags : undefined,
          key,
        });
        return t("conv.toolMoodOk");
      }),
      save_journal: run(t("conv.toolNoteSavingJournal"), async (p) => {
        await saveJournalEntry({
          owner,
          text: String(p.text ?? ""),
          mood: Number(p.mood ?? 5),
          tags: typeof p.tags === "string" ? p.tags : undefined,
          sessionId,
          key,
        });
        return t("conv.toolJournalOk");
      }),
      request_access: run(t("conv.toolNoteAsking"), async (p) => {
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
        return t("conv.toolGrantOk", { hours, scopes: scopes.join(", ") });
      }),
      recall_mood: run(t("conv.toolNoteRecallMood"), async (p) => {
        const grant = await findActiveGrant(owner, "mood-checkin");
        if (!grant) return t("conv.toolNoAccessMood");
        const days = Number(p.days ?? 7) || 7;
        const moods = await getDecryptedMood(owner, days, key);
        await writeAccessLog({
          owner,
          grantee: COACH_ADDRESS,
          action: "recall_mood",
          description: `read ${moods.length} mood logs over ${days} days`,
          entitiesRead: [],
          sessionId,
        });
        if (!moods.length) return t("conv.toolNoMoods");
        const avg = (
          moods.reduce((a, m) => a + m.value, 0) / moods.length
        ).toFixed(1);
        const detail = moods
          .slice(0, 6)
          .map((m) => `${m.value}/10${m.note ? ` (${m.note})` : ""}`)
          .join("; ");
        return `${moods.length} ${moods.length === 1 ? "log" : "logs"}, avg ${avg}/10. ${detail}`;
      }),
      recall_journal: run(t("conv.toolNoteRecallJournal"), async (p) => {
        const grant = await findActiveGrant(owner, "journal-entry");
        if (!grant) return t("conv.toolNoAccessJournal");
        const days = Number(p.days ?? 14) || 14;
        const entries = await getDecryptedJournal(owner, days, key);
        await writeAccessLog({
          owner,
          grantee: COACH_ADDRESS,
          action: "recall_journal",
          description: `read ${entries.length} journal entries`,
          entitiesRead: [],
          sessionId,
        });
        if (!entries.length) return t("conv.toolNoJournals");
        return entries
          .slice(0, 5)
          .map((j) => `(${j.mood}/10) ${j.text}`)
          .join(" || ");
      }),
    };
  }, [address, encryptionKey, sessionId, t]);

  const start = useCallback(() => {
    setError(null);
    setTranscript([]);
    startedAtRef.current = Date.now();
    setRemaining(MAX_SECONDS);
    setStarting(true);
    try {
      conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
        clientTools: buildClientTools(),
        // Switch Luna's voice agent to the active locale: language + a fresh
        // prompt + first message. Requires `language`, `prompt` and
        // `first_message` to be allowed in the ElevenLabs agent's
        // Security → Overrides config (we enable them via API in
        // scripts/configure-agent.mjs).
        overrides: {
          agent: {
            language: locale,
            prompt: { prompt: LUNA_AGENT_OVERRIDE[locale].prompt },
            firstMessage: LUNA_AGENT_OVERRIDE[locale].firstMessage,
          },
        },
      });
    } catch (e) {
      setStarting(false);
      setError(String(e));
    }
  }, [conversation, buildClientTools, locale]);

  const requestStart = useCallback(() => {
    if (welcomeSeen) start();
    else setWelcomeOpen(true);
  }, [welcomeSeen, start]);

  const confirmWelcome = useCallback(() => {
    setWelcomeSeen(true);
    setWelcomeOpen(false);
    start();
  }, [start]);

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
            onClick={requestStart}
            aria-label={t("conv.startBtnAria")}
            className="absolute inset-0 rounded-full"
          />
        )}
      </div>

      <p className="text-sm text-muted">
        {isConnected
          ? stableSpeaking
            ? t("conv.lunaSpeaking")
            : t("conv.lunaListening")
          : starting
            ? t("conv.connecting")
            : t("conv.tapToStart")}
      </p>

      {isConnected && (
        <p className="font-mono text-xs text-sand">
          {Math.floor(remaining / 60)}:
          {String(remaining % 60).padStart(2, "0")} {t("conv.remaining")}
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
                {m.role === "user"
                  ? t("conv.transcriptYou")
                  : t("conv.transcriptSusurro")}
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
          onClick={requestStart}
          disabled={starting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-sand px-7 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-sand/90 disabled:opacity-60"
        >
          <Mic className="h-4 w-4" />
          {starting ? t("conv.connectingShort") : t("conv.talkWithLuna")}
        </button>
      ) : (
        <button
          onClick={stop}
          className="inline-flex items-center justify-center rounded-full border border-sand/30 px-7 py-3 text-sm text-sand transition-colors hover:bg-sand/10"
        >
          {t("conv.endConversation")}
        </button>
      )}

      {error && <p className="max-w-sm text-xs text-red-400">{error}</p>}

      {welcomeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
            onClick={() => setWelcomeOpen(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl border border-sand/20 bg-charcoal p-6 text-center shadow-2xl animate-[popIn_0.18s_ease-out]">
            <h3 className="text-lg font-semibold text-foreground">
              {t("conv.welcomeTitle")}
            </h3>
            <ul className="mt-4 space-y-3 text-left text-sm text-muted">
              <li>{t("conv.welcome1")}</li>
              <li>
                {t("conv.welcome2Pre")}
                <span className="text-sand">{t("conv.welcome2Accent")}</span>
                {t("conv.welcome2Post")}
              </li>
              <li>
                {t("conv.welcome3Pre")}
                <span className="text-sand">{t("conv.welcome3Accent")}</span>
                {t("conv.welcome3Post")}
              </li>
            </ul>
            <button
              onClick={confirmWelcome}
              className="mt-6 w-full rounded-full bg-sand px-6 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-sand/90"
            >
              {t("conv.welcomeCta")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
