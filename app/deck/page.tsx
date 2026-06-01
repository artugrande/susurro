"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { PresenceBlob } from "@/components/presence-blob";
import { MoodTimeline } from "@/components/mood-timeline";
import { ThreadsView } from "@/components/threads-view";
import { computeStats } from "@/lib/stats";
import { useDemoEntries } from "@/lib/demo";
import { useT } from "@/lib/i18n";

/* ---------- slide building blocks ---------- */

function Slide({
  title,
  kicker,
  children,
}: {
  title?: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center">
      {kicker && (
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-sand/70">
          {kicker}
        </p>
      )}
      {title && (
        <h2 className="mb-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
      )}
      <div className="space-y-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
        {children}
      </div>
    </div>
  );
}

function Stat({
  big,
  label,
  small,
  href,
  sourceLabel,
}: {
  big: string;
  label?: string;
  small: string;
  href?: string;
  sourceLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-sand/25 bg-sand/5 p-5">
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-semibold text-sand">{big}</div>
        {label && (
          <div className="text-lg font-semibold text-foreground">{label}</div>
        )}
      </div>
      <div className="mt-1 text-sm text-muted">
        {small}
        {href && (
          <>
            {" · "}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sand underline underline-offset-2"
            >
              {sourceLabel}
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sand" />
      <span>{children}</span>
    </li>
  );
}

/* ---------- deck ---------- */

export default function Deck() {
  const t = useT();
  const router = useRouter();
  const entries = useDemoEntries();
  const stats = useMemo(() => computeStats(entries), [entries]);

  // Slides depend on the current locale via t() and entries — rebuild each render.
  const slides: ReactNode[] = useMemo(
    () => [
      // 0 — Title
      <div
        key="title"
        className="flex h-full flex-col items-center justify-center text-center"
      >
        <PresenceBlob state="idle" className="h-44 w-44" />
        <div className="mt-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logosusurro.svg" alt="" className="h-10 w-auto" />
          <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Susurro
          </span>
        </div>
        <p className="mt-5 max-w-xl text-pretty text-lg text-sand">
          {t("deck.heroTagline")}
        </p>
        <div className="mt-8 flex items-center gap-4 opacity-70">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
            {t("deck.poweredBy")}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/elevenlogo.png" alt="ElevenLabs" className="h-4 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/arkivwhite.png" alt="Arkiv" className="h-4 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vercellogo.png" alt="Vercel" className="h-4 w-auto" />
        </div>
        <p className="mt-3 text-xs text-muted/70">{t("deck.heroFooter")}</p>
      </div>,

      // 1 — Salta / loneliness
      <Slide
        key="salta"
        kicker={t("deck.saltaKicker")}
        title={t("deck.saltaTitle")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat
            big={t("deck.saltaStat1Big")}
            small={t("deck.saltaStat1Text")}
            href="https://www.pagina12.com.ar/782016-salta-duplica-el-promedio-nacional-de-suicidios/"
            sourceLabel={t("deck.source")}
          />
          <Stat
            big={t("deck.saltaStat2Big")}
            small={t("deck.saltaStat2Text")}
            href="https://www.ahorasalta.com.ar/noticias/salud-17/salta-es-una-de-las-provincias-del-pais-con-mayor-cantidad-de-suicidios-12228"
            sourceLabel={t("deck.source")}
          />
        </div>
        <ul className="space-y-3">
          <Bullet>
            {t("deck.saltaBullet1").split("{{accent}}").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="text-sand">{t("deck.saltaBullet1Accent")}</span>
                )}
              </span>
            ))}
          </Bullet>
          <Bullet>{t("deck.saltaBullet2")}</Bullet>
        </ul>
      </Slide>,

      // 2 — Problem
      <Slide
        key="problem"
        kicker={t("deck.problemKicker")}
        title={t("deck.problemTitle")}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat
            big={t("deck.problemStat1Big")}
            label={t("deck.problemStat1Label")}
            small={t("deck.problemStat1Text")}
            href="https://hbr.org/2025/04/how-people-are-really-using-gen-ai-in-2025"
            sourceLabel={t("deck.source")}
          />
          <Stat
            big={t("deck.problemStat2Big")}
            small={t("deck.problemStat2Text")}
            href="https://www.simplypsychology.com/articles/journaling-for-mental-health"
            sourceLabel={t("deck.source")}
          />
        </div>
        <ul className="space-y-3">
          <Bullet>{t("deck.problemBullet1")}</Bullet>
          <Bullet>{t("deck.problemBullet2")}</Bullet>
          <Bullet>
            {t("deck.problemBullet3").split("{{accent}}").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="text-sand">
                    {t("deck.problemBullet3Accent")}
                  </span>
                )}
              </span>
            ))}
          </Bullet>
        </ul>
      </Slide>,

      // 3 — Solution
      <Slide
        key="solution"
        kicker={t("deck.solutionKicker")}
        title={t("deck.solutionTitle")}
      >
        <p>
          {t("deck.solutionBody").split("{{accent}}").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="text-sand">{t("deck.solutionBodyAccent")}</span>
              )}
            </span>
          ))}
        </p>
        <ul className="space-y-3">
          <Bullet>{t("deck.solutionBullet1")}</Bullet>
          <Bullet>{t("deck.solutionBullet2")}</Bullet>
          <Bullet>{t("deck.solutionBullet3")}</Bullet>
          <Bullet>{t("deck.solutionBullet4")}</Bullet>
        </ul>
      </Slide>,

      // 4 — Product — conversation
      <div
        key="prod-convo"
        className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-sand/70">
          {t("deck.prodConvoKicker")}
        </p>
        <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("deck.prodConvoTitle")}
        </h2>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
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
                strokeDashoffset={2 * Math.PI * 112 * 0.25}
              />
            </svg>
            <PresenceBlob state="speaking" className="h-36 w-36" />
          </div>
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
              <p className="text-sm text-sand">{t("showcase.mockLunaReply")}</p>
            </div>
            <p className="text-center font-mono text-xs text-sand">
              {t("deck.prodConvoTimer")}
            </p>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted">{t("deck.prodConvoFooter")}</p>
      </div>,

      // 5 — Product — dashboard
      <div
        key="prod-dash"
        className="mx-auto flex h-full w-full max-w-5xl flex-col justify-center"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-sand/70">
          {t("deck.prodDashKicker")}
        </p>
        <h2 className="mb-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("deck.prodDashTitle")}
        </h2>
        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-sand">
            <Flame className="h-4 w-4" />
            {stats.streak}
            <span className="font-normal text-muted">
              {stats.streak === 1 ? t("stats.dayInRow") : t("stats.daysInRow")}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            {stats.total}
            <span className="font-normal text-muted">{t("stats.entries")}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            {stats.todayDone ? "✓" : "—"}
            <span className="font-normal text-muted">{t("stats.today")}</span>
          </span>
        </div>
        <MoodTimeline entries={entries} />
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <ThreadsView entries={entries} />
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[0.65rem] text-muted">
              {t("showcase.recsHeading")}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/vercellogo.png" alt="Vercel" className="h-3 w-auto" />{" "}
              {t("showcase.aiGateway")}
            </div>
            <ul className="space-y-2 text-sm">
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
      </div>,

      // 6 — How it works
      <Slide key="how" kicker={t("deck.howKicker")} title={t("deck.howTitle")}>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 font-mono text-sm leading-relaxed text-foreground/90">
          {t("deck.howFlow1")}
          <br />→ {t("deck.howFlow2")}
          <br />→ {t("deck.howFlow3")}
          <br />→ {t("deck.howFlow4")}
        </div>
        <p className="text-sm text-muted">{t("deck.howStackLabel")}</p>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <Bullet>Next.js + TypeScript</Bullet>
          <Bullet>ElevenLabs Conversational AI</Bullet>
          <Bullet>Arkiv (testnet BRAGA)</Bullet>
          <Bullet>AES-256-GCM (client-side)</Bullet>
        </ul>
      </Slide>,

      // 7 — Why Arkiv
      <Slide
        key="arkiv"
        kicker={t("deck.arkivKicker")}
        title={t("deck.arkivTitle")}
      >
        <ul className="space-y-3">
          <Bullet>
            <b className="text-sand">{t("deck.arkivBullet1Bold")}</b>
            {t("deck.arkivBullet1Rest")}
          </Bullet>
          <Bullet>
            <b className="text-sand">{t("deck.arkivBullet2Bold")}</b>
            {t("deck.arkivBullet2Rest")}
          </Bullet>
          <Bullet>
            <b className="text-sand">{t("deck.arkivBullet3Bold")}</b>
            {t("deck.arkivBullet3Rest")}
          </Bullet>
          <Bullet>
            <b className="text-sand">{t("deck.arkivBullet4Bold")}</b>
            {t("deck.arkivBullet4Rest")}
          </Bullet>
        </ul>
      </Slide>,

      // 8 — Tracks
      <Slide
        key="tracks"
        kicker={t("deck.tracksKicker")}
        title={t("deck.tracksTitle")}
      >
        <ul className="space-y-3">
          <Bullet>
            <b className="text-sand">{t("deck.tracks1Bold")}</b>
            {t("deck.tracks1Rest")}
          </Bullet>
          <Bullet>
            <b className="text-sand">{t("deck.tracks2Bold")}</b>
            {t("deck.tracks2Rest")}
          </Bullet>
          <Bullet>
            <b className="text-sand">{t("deck.tracks3Bold")}</b>
            {t("deck.tracks3Rest")}
          </Bullet>
        </ul>
      </Slide>,

      // 9 — Business model
      <Slide
        key="biz"
        kicker={t("deck.bizKicker")}
        title={t("deck.bizTitle")}
      >
        <p className="text-sm text-muted">{t("deck.bizDesc")}</p>
        <div className="overflow-hidden rounded-2xl border border-white/10 text-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 text-xs text-muted">
                <th className="px-3 py-2 text-left font-normal">{t("deck.bizColPlan")}</th>
                <th className="px-3 py-2 text-left font-normal">{t("deck.bizColUsage")}</th>
                <th className="px-3 py-2 text-left font-normal">{t("deck.bizColPrice")}</th>
                <th className="px-3 py-2 text-left font-normal">{t("deck.bizColVoiceCost")}</th>
                <th className="px-3 py-2 text-left font-normal">{t("deck.bizColProfit")}</th>
              </tr>
            </thead>
            <tbody className="text-foreground/90">
              <tr className="border-t border-white/5">
                <td className="px-3 py-2 text-sand">{t("deck.bizPlanCasual")}</td>
                <td className="px-3 py-2">{t("deck.bizUsage1")}</td>
                <td className="px-3 py-2">$6.99</td>
                <td className="px-3 py-2 text-muted">$3.60</td>
                <td className="px-3 py-2 text-emerald-300">+$3.39</td>
              </tr>
              <tr className="border-t border-white/5">
                <td className="px-3 py-2 text-sand">{t("deck.bizPlanRegular")}</td>
                <td className="px-3 py-2">{t("deck.bizUsage2")}</td>
                <td className="px-3 py-2">$14.99</td>
                <td className="px-3 py-2 text-muted">$10.80</td>
                <td className="px-3 py-2 text-emerald-300">+$4.19</td>
              </tr>
              <tr className="border-t border-white/5">
                <td className="px-3 py-2 text-sand">{t("deck.bizPlanPower")}</td>
                <td className="px-3 py-2">{t("deck.bizUsage3")}</td>
                <td className="px-3 py-2">$29.99</td>
                <td className="px-3 py-2 text-muted">$25.20</td>
                <td className="px-3 py-2 text-emerald-300">+$4.79</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted">{t("deck.bizFooter")}</p>
      </Slide>,

      // 10 — Roadmap V2
      <Slide
        key="roadmap"
        kicker={t("deck.roadmapKicker")}
        title={t("deck.roadmapTitle")}
      >
        <ul className="space-y-3">
          <Bullet>
            <b className="text-sand">{t("deck.roadmap1Bold")}</b>
            {t("deck.roadmap1Rest")}
          </Bullet>
          <Bullet>
            <b className="text-sand">{t("deck.roadmap2Bold")}</b>
            {t("deck.roadmap2Rest").split("{{accent}}").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="text-sand">{t("deck.roadmap2Accent")}</span>
                )}
              </span>
            ))}
          </Bullet>
          <Bullet>
            <b className="text-sand">{t("deck.roadmap3Bold")}</b>
            {t("deck.roadmap3Rest")}
          </Bullet>
        </ul>
        <div className="mt-2 flex items-center gap-5 opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/celologo.png" alt="Celo" className="h-6 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/minipaylogo.png" alt="MiniPay" className="h-6 w-auto" />
        </div>
      </Slide>,

      // 11 — Builder
      <div
        key="builder"
        className="mx-auto flex h-full w-full max-w-3xl flex-col justify-center"
      >
        <div className="flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/artugrandefounder.jpg"
            alt="Arturo Grande"
            className="h-24 w-24 shrink-0 rounded-full border border-sand/30 object-cover"
          />
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-sand/70">
              {t("deck.builderKicker")}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("deck.builderTitle")}
            </h2>
          </div>
        </div>
        <ul className="mt-6 space-y-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
          <Bullet>{t("deck.builder1")}</Bullet>
          <Bullet>
            {t("deck.builder2Pre")}
            <b className="text-sand">{t("deck.builder2Accent")}</b>
            {t("deck.builder2Post")}
          </Bullet>
          <Bullet>{t("deck.builder3")}</Bullet>
          <Bullet>{t("deck.builder4")}</Bullet>
        </ul>
      </div>,

      // 12 — Close
      <div
        key="close"
        className="flex h-full flex-col items-center justify-center text-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logosusurro.svg"
          alt="Susurro"
          className="mb-6 h-20 w-auto opacity-90"
        />
        <h2 className="text-4xl font-semibold tracking-tight text-foreground">
          {t("deck.closeTitle")}
        </h2>
        <p className="mt-3 text-sand">{t("deck.closeSub")}</p>
        <div className="mt-8 flex flex-col gap-2 text-sm">
          <a
            href="https://susurro-nine.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sand underline underline-offset-4 hover:text-foreground"
          >
            {t("deck.closeLinkDemo")}
          </a>
          <a
            href="https://github.com/artugrande/susurro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sand underline underline-offset-4 hover:text-foreground"
          >
            {t("deck.closeLinkCode")}
          </a>
          <a
            href="https://x.com/ArtuGrande"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sand underline underline-offset-4 hover:text-foreground"
          >
            {t("deck.closeLinkTwitter")}
          </a>
        </div>
      </div>,
    ],
    [t, entries, stats],
  );

  const [i, setI] = useState(0);
  const total = slides.length;

  const next = useCallback(
    () => setI((v) => Math.min(v + 1, total - 1)),
    [total],
  );
  const prev = useCallback(() => setI((v) => Math.max(v - 1, 0)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, router]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-6 py-6">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[55rem] w-[55rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(203,185,157,0.15),_transparent_60%)]" />
      </div>

      <div className="flex w-full flex-1 items-stretch">
        {/* prev */}
        <button
          onClick={prev}
          aria-label="Anterior"
          disabled={i === 0}
          className="hidden shrink-0 px-2 text-sand/60 transition-colors hover:text-sand disabled:opacity-30 sm:block"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div className="flex flex-1 items-center justify-center">
          {slides[i]}
        </div>

        {/* next */}
        <button
          onClick={next}
          aria-label="Siguiente"
          disabled={i === total - 1}
          className="hidden shrink-0 px-2 text-sand/60 transition-colors hover:text-sand disabled:opacity-30 sm:block"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <footer className="mt-4 flex w-full items-center justify-between text-xs text-muted/60">
        <span className="hidden sm:inline">{t("deck.navHint")}</span>
        <span className="font-mono">
          {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </footer>
    </main>
  );
}
