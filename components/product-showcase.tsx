"use client";

import type { ReactNode } from "react";
import { Flame } from "lucide-react";
import { PresenceBlob } from "@/components/presence-blob";
import { MoodTimeline } from "@/components/mood-timeline";
import { ThreadsView } from "@/components/threads-view";
import { computeStats } from "@/lib/stats";
import { DEMO_ENTRIES } from "@/lib/demo";

function Stat({
  value,
  label,
  accent,
}: {
  value: ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-3">
      <div
        className={`flex items-center justify-center gap-1 text-lg font-semibold ${
          accent ? "text-sand" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="text-[0.65rem] text-muted">{label}</div>
    </div>
  );
}

/**
 * Live, visual preview of the product — the same real components the app
 * renders (mood timeline, threads, streak), plus a voice-check-in mock and
 * AI recommendations. Used on the landing so the value prop is concrete.
 */
export function ProductShowcase() {
  const stats = computeStats(DEMO_ENTRIES);

  return (
    <div className="w-full">
      <div className="grid gap-6 text-left lg:grid-cols-2 lg:items-center">
        {/* voice check-in mock */}
        <div className="flex flex-col items-center gap-4">
          <PresenceBlob state="speaking" className="h-28 w-28" />
          <div className="w-full space-y-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <span className="text-[0.6rem] uppercase tracking-wider text-muted">
                vos
              </span>
              <p className="text-sm text-foreground/90">
                Hoy ando en un cuatro… discutí con mi pareja y me quedó dando
                vueltas todo el día.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <span className="text-[0.6rem] uppercase tracking-wider text-muted">
                luna
              </span>
              <p className="text-sm text-sand">
                Qué feo cuando una charla queda picando. Lo anoto. ¿Pasó algo
                puntual o se fue escalando solo?
              </p>
            </div>
            <p className="text-center font-mono text-xs text-sand">
              check-in de 3 min · voz natural (ElevenLabs)
            </p>
          </div>
        </div>

        {/* dashboard preview */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <Stat
              accent
              value={
                <>
                  <Flame className="h-4 w-4" />
                  {stats.streak}
                </>
              }
              label={stats.streak === 1 ? "día seguido" : "días seguidos"}
            />
            <Stat value={stats.total} label="registros" />
            <Stat value={stats.todayDone ? "✓" : "—"} label="hoy" />
          </div>
          <MoodTimeline entries={DEMO_ENTRIES} />
          <ThreadsView entries={DEMO_ENTRIES} />
        </div>
      </div>

      {/* AI recommendations */}
      <div className="mt-6 text-left">
        <div className="mb-2 flex items-center justify-center gap-1.5 text-[0.65rem] text-muted">
          Recomendaciones para esta semana · generado con
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vercellogo.png" alt="Vercel" className="h-3 w-auto" /> AI
          Gateway
        </div>
        <ul className="grid gap-2 text-sm sm:grid-cols-3">
          <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-foreground/90">
            Retomá la charla con tu pareja desde lo que sentís, no desde el
            cansancio.
          </li>
          <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-foreground/90">
            Repetí esas cenas con amigos: es lo que más te recarga.
          </li>
          <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-foreground/90">
            En las noches bajón, dejá el teléfono lejos 20 minutos antes de
            dormir.
          </li>
        </ul>
      </div>
    </div>
  );
}
