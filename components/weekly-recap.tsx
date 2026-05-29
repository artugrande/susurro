"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Play, Pause, Loader2 } from "lucide-react";
import { buildWeeklyRecap } from "@/lib/stats";
import type { MyEntry } from "@/lib/read";

export function WeeklyRecap({ entries }: { entries: MyEntry[] }) {
  const recap = buildWeeklyRecap(entries);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function toggle() {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: recap.text }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      await audio.play();
      setPlaying(true);
    } catch {
      toast.error("No pude generar el audio. Reintentá.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-sand/20 bg-sand/5 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">
          Resumen de tu semana
        </h3>
        <button
          onClick={toggle}
          disabled={loading || !recap.hasData}
          className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-xs font-medium text-charcoal transition-colors hover:bg-sand/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : playing ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {loading ? "Generando…" : playing ? "Pausar" : "Reproducir"}
        </button>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{recap.text}</p>
      {recap.hasData && (
        <p className="mt-2 text-[0.65rem] text-muted">Resumen en audio · voz IA</p>
      )}
    </div>
  );
}
