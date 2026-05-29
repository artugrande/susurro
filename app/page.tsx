import Link from "next/link";
import { PresenceBlob } from "@/components/presence-blob";
import { ProductShowcase } from "@/components/product-showcase";

function LaunchButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/app"
      className={`inline-flex items-center justify-center rounded-full bg-sand px-7 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-sand/90 ${className}`}
    >
      Lanzar la app →
    </Link>
  );
}

export default function Landing() {
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
          Un compañero de bienestar con voz. Lo que le contás vive cifrado —
          y es tuyo, no de una plataforma.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <LaunchButton />
          <Link
            href="/deck"
            className="inline-flex items-center justify-center rounded-full border border-sand/30 px-7 py-3 text-sm text-sand transition-colors hover:bg-sand/10"
          >
            Ver el pitch
          </Link>
        </div>
        <div className="mt-10 flex items-center gap-4 opacity-70">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
            Powered by
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
          El problema
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          La gente ya usa la IA como terapeuta. Pero tiene que elegir.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-sand/25 bg-sand/5 p-5 text-left">
            <div className="text-3xl font-semibold text-sand">#1</div>
            <p className="mt-1 text-sm text-muted">
              Uso de IA generativa en 2025: terapia y compañía (Harvard Business
              Review).
            </p>
          </div>
          <div className="rounded-2xl border border-sand/25 bg-sand/5 p-5 text-left">
            <div className="text-3xl font-semibold text-sand">31%</div>
            <p className="mt-1 text-sm text-muted">
              De todo el uso de IA — casi el doble que en 2024.
            </p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-xl text-pretty leading-relaxed text-foreground/90">
          ChatGPT tiene un chat efímero para hablar de cosas sensibles, pero sin
          memoria no hay contexto. Hoy elegís:{" "}
          <span className="text-sand">o privacidad, o continuidad</span>. Susurro
          te da las dos.
        </p>
      </section>

      {/* ---------- product showcase ---------- */}
      <section className="w-full max-w-4xl py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sand/70">
          El producto
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Hablás con Luna. Tu semana queda cifrada y tuya.
        </h2>
        <p className="mx-auto mt-3 mb-10 max-w-xl text-pretty leading-relaxed text-muted">
          Check-ins de 3 minutos por voz. Susurro arma tu racha, ve tus patrones
          y te sugiere pasos chiquitos — todo cifrado de punta a punta.
        </p>
        <ProductShowcase />
      </section>

      {/* ---------- how it works ---------- */}
      <section className="w-full max-w-4xl py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-sand/70">
          Cómo funciona
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Hablás con Luna",
              d: "Un coach de voz natural, cálido, en argentino. Check-ins de 3 minutos.",
            },
            {
              n: "2",
              t: "Se cifra y vive en Arkiv",
              d: "Lo que decís se cifra en tu navegador con una llave derivada de tu wallet.",
            },
            {
              n: "3",
              t: "Vos tenés el control",
              d: "Le das acceso por tiempo limitado, lo cortás y borrás tu data cuando querés.",
            },
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
          Por qué Arkiv
        </p>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground/90">
          Tu memoria vive en Arkiv: consultable, con expiración nativa y borrado
          real. Solo tu wallet descifra tu contenido — ni siquiera nuestro
          servidor puede leerlo.
        </p>
      </section>

      {/* ---------- final cta ---------- */}
      <section className="flex w-full max-w-2xl flex-col items-center py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Tu confianza es tuya.
        </h2>
        <LaunchButton className="mt-8" />
      </section>

      <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-muted/80">
        Susurro, no reemplaza a un terapeuta profesional · Arkiv × Puna Tech 2026
        <div className="mt-2 flex justify-center gap-4">
          <a
            href="https://github.com/artugrande/susurro"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sand"
          >
            GitHub
          </a>
          <Link href="/deck" className="hover:text-sand">
            Pitch deck
          </Link>
          <Link href="/app" className="hover:text-sand">
            Lanzar app
          </Link>
        </div>
      </footer>
    </main>
  );
}
