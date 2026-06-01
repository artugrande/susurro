"use client";

import type { ReactNode } from "react";
import { Flame } from "lucide-react";
import { PresenceBlob } from "@/components/presence-blob";
import { MoodTimeline } from "@/components/mood-timeline";
import { ThreadsView } from "@/components/threads-view";
import { computeStats } from "@/lib/stats";
import { useDemoEntries } from "@/lib/demo";
import { useT } from "@/lib/i18n";

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
  const t = useT();
  const entries = useDemoEntries();
  const stats = computeStats(entries);

  return (
    <div className="w-full">
      <div className="grid gap-6 text-left lg:grid-cols-2 lg:items-center">
        {/* voice check-in mock */}
        <div className="flex flex-col items-center gap-4">
          <PresenceBlob state="speaking" className="h-28 w-28" />
          <div className="w-full space-y-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <span className="text-[0.6rem] uppercase tracking-wider text-muted">
                {t("showcase.mockVos")}
              </span>
              <p className="text-sm text-foreground/90">
                {t("showcase.mockVosMsg")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <span className="text-[0.6rem] uppercase tracking-wider text-muted">
                {t("showcase.mockLuna")}
              </span>
              <p className="text-sm text-sand">
                {t("showcase.mockLunaReply")}
              </p>
            </div>
            <p className="text-center font-mono text-xs text-sand">
              {t("showcase.checkinFooter")}
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
              label={
                stats.streak === 1 ? t("stats.dayInRow") : t("stats.daysInRow")
              }
            />
            <Stat value={stats.total} label={t("stats.entries")} />
            <Stat
              value={stats.todayDone ? "✓" : "—"}
              label={t("stats.today")}
            />
          </div>
          <MoodTimeline entries={entries} />
          <ThreadsView entries={entries} />
        </div>
      </div>

      {/* AI recommendations */}
      <div className="mt-6 text-left">
        <div className="mb-2 flex items-center justify-center gap-1.5 text-[0.65rem] text-muted">
          {t("showcase.recsHeading")}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vercellogo.png" alt="Vercel" className="h-3 w-auto" />{" "}
          {t("showcase.aiGateway")}
        </div>
        <ul className="grid gap-2 text-sm sm:grid-cols-3">
          <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-foreground/90">
            {t("showcase.rec1")}
          </li>
          <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-foreground/90">
            {t("showcase.rec2")}
          </li>
          <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-foreground/90">
            {t("showcase.rec3")}
          </li>
        </ul>
      </div>
    </div>
  );
}
