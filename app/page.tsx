"use client";

import Link from "next/link";
import { PresenceBlob } from "@/components/presence-blob";
import { ProductShowcase } from "@/components/product-showcase";
import { useT } from "@/lib/i18n";

function LaunchButton({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <Link
      href="/app"
      className={`inline-flex items-center justify-center rounded-full bg-sand px-7 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-sand/90 ${className}`}
    >
      {t("landing.launchApp")}
    </Link>
  );
}

export default function Landing() {
  const t = useT();
  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-x-hidden px-6">
      {/* warm radial glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[20%] h-[55rem] w-[55rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(203,185,157,0.14),_transparent_60%)]" />
      </div>

      {/* ---------- hero ---------- */}
      <section className="flex min-h-dvh flex-col items-center justify-center text-center animate-[floatIn_0.6s_ease-out]">
        <PresenceBlob state="idle" className="h-52 w-52" />
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
          Susurro
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-sand">
          {t("landing.heroTagline")}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <LaunchButton />
          <Link
            href="/deck"
            className="inline-flex items-center justify-center rounded-full border border-sand/30 px-7 py-3 text-sm text-sand transition-colors hover:bg-sand/10"
          >
            {t("landing.viewPitch")}
          </Link>
        </div>
        <div className="mt-10 flex items-center gap-4 opacity-70">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
            {t("landing.poweredBy")}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/elevenlogo.png" alt="ElevenLabs" className="h-4 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/arkivwhite.png" alt="Arkiv" className="h-4 w-auto" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vercellogo.png" alt="Vercel" className="h-4 w-auto" />
        </div>
      </section>

      {/* ---------- problem ---------- */}
      <section className="w-full max-w-3xl py-20 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sand/70">
          {t("landing.problemKicker")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("landing.problemH2")}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-sand/25 bg-sand/5 p-5 text-left">
            <div className="text-3xl font-semibold text-sand">#1</div>
            <p className="mt-1 text-sm text-muted">
              {t("landing.problemStat1")}
            </p>
          </div>
          <div className="rounded-2xl border border-sand/25 bg-sand/5 p-5 text-left">
            <div className="text-3xl font-semibold text-sand">31%</div>
            <p className="mt-1 text-sm text-muted">
              {t("landing.problemStat2")}
            </p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-xl text-pretty leading-relaxed text-foreground/90">
          {t("landing.problemBody1")}
          <span className="text-sand">{t("landing.problemBodyHighlight")}</span>
          {t("landing.problemBody2")}
        </p>
      </section>

      {/* ---------- product showcase ---------- */}
      <section className="w-full max-w-4xl py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sand/70">
          {t("landing.productKicker")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("landing.productH2")}
        </h2>
        <p className="mx-auto mt-3 mb-10 max-w-xl text-pretty leading-relaxed text-muted">
          {t("landing.productTagline")}
        </p>
        <ProductShowcase />
      </section>

      {/* ---------- how it works ---------- */}
      <section className="w-full max-w-4xl py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sand/70">
          {t("landing.howKicker")}
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { n: "1", t: t("landing.how1Title"), d: t("landing.how1Desc") },
            { n: "2", t: t("landing.how2Title"), d: t("landing.how2Desc") },
            { n: "3", t: t("landing.how3Title"), d: t("landing.how3Desc") },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sand/15 font-mono text-sm text-sand">
                {s.n}
              </div>
              <h3 className="mt-4 font-medium text-foreground">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- why arkiv ---------- */}
      <section className="w-full max-w-2xl py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sand/70">
          {t("landing.whyArkivKicker")}
        </p>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground/90">
          {t("landing.whyArkivBody")}
        </p>
      </section>

      {/* ---------- final cta ---------- */}
      <section className="flex w-full max-w-2xl flex-col items-center py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          {t("landing.finalCtaH2")}
        </h2>
        <LaunchButton className="mt-8" />
      </section>

      <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-muted/80">
        {t("footer.disclaimer")} · Arkiv × Puna Tech 2026
        <div className="mt-2 flex justify-center gap-4">
          <a
            href="https://github.com/artugrande/susurro"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sand"
          >
            {t("footer.github")}
          </a>
          <Link href="/deck" className="hover:text-sand">
            {t("footer.pitch")}
          </Link>
          <Link href="/app" className="hover:text-sand">
            {t("footer.launchApp")}
          </Link>
        </div>
      </footer>
    </main>
  );
}
