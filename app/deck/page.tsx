"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
      )}
      <div className="space-y-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
        {children}
      </div>
    </div>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div className="rounded-2xl border border-sand/25 bg-sand/5 p-5">
      <div className="text-3xl font-semibold text-sand">{big}</div>
      <div className="mt-1 text-sm text-muted">{small}</div>
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

/* ---------- slides ---------- */

const slides: ReactNode[] = [
  // 0 — Title
  <div
    key="title"
    className="flex h-full flex-col items-center justify-center text-center"
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logosusurro.svg" alt="Susurro" className="mb-6 h-28 w-auto" />
    <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
      Susurro
    </h1>
    <p className="mt-5 max-w-xl text-pretty text-lg text-sand">
      Un coach de bienestar con voz. Tu memoria vive cifrada — y es tuya.
    </p>
    <div className="mt-8 flex items-center gap-4 opacity-70">
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">
        Powered by
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/elevenlogo.png" alt="ElevenLabs" className="h-4 w-auto" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/arkivwhite.png" alt="Arkiv" className="h-4 w-auto" />
    </div>
    <p className="mt-3 text-xs text-muted/70">Arkiv × Puna Tech 2026</p>
  </div>,

  // 1 — Problem
  <Slide key="problem" kicker="El problema" title="La gente ya usa la IA como terapeuta. Pero tiene que elegir: privacidad o memoria.">
    <div className="grid gap-4 sm:grid-cols-2">
      <Stat big="#1" small="Uso de IA generativa en 2025: “Terapia y compañía” (Harvard Business Review)" />
      <Stat big="31%" small="De todo el uso de IA — casi el doble que en 2024 (17%)" />
    </div>
    <ul className="space-y-3">
      <Bullet>
        La gente recurre a la IA para procesar duelo, ansiedad y soledad, sin
        miedo al juicio y a cualquier hora.
      </Bullet>
      <Bullet>
        ChatGPT ofrece un “chat efímero” para hablar de temas sensibles sin que
        se guarden — pero sin memoria, no hay contexto ni seguimiento.
      </Bullet>
      <Bullet>
        El dilema: <span className="text-sand">o privacidad, o continuidad</span>.
        Hoy no podés tener las dos.
      </Bullet>
    </ul>
  </Slide>,

  // 2 — Solution
  <Slide key="solution" kicker="La solución" title="Susurro: voz + memoria cifrada que es tuya.">
    <p>
      Un coach de bienestar con voz cuya memoria vive cifrada en Arkiv y es 100%
      del usuario. Privacidad <span className="text-sand">y</span> continuidad.
    </p>
    <ul className="space-y-3">
      <Bullet>Hablás con voz natural; el contexto persiste entre sesiones.</Bullet>
      <Bullet>Todo se cifra en tu navegador con una llave derivada de tu wallet.</Bullet>
      <Bullet>Le das acceso al coach por el tiempo que querés — y lo cortás cuando querés.</Bullet>
      <Bullet>Ves tu data, borrás registros uno por uno o todo de una.</Bullet>
    </ul>
  </Slide>,

  // 3 — How it works
  <Slide key="how" kicker="Cómo funciona" title="Voz que entiende, memoria que es tuya.">
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 font-mono text-sm leading-relaxed text-foreground/90">
      🎙️ hablás
      <br />→ ElevenLabs (voz + el agente decide una acción)
      <br />→ se cifra en tu navegador
      <br />→ Arkiv guarda el dato (la app paga el gas, vos no)
      <br />→ el coach te responde por voz
    </div>
    <p className="text-sm text-muted">Stack</p>
    <ul className="grid gap-2 text-sm sm:grid-cols-2">
      <Bullet>Next.js + TypeScript</Bullet>
      <Bullet>ElevenLabs Conversational AI</Bullet>
      <Bullet>Arkiv (testnet BRAGA)</Bullet>
      <Bullet>AES-256-GCM (cifrado del lado del cliente)</Bullet>
    </ul>
  </Slide>,

  // 4 — Why Arkiv
  <Slide key="arkiv" kicker="Por qué Arkiv" title="La capa de datos correcta para esto.">
    <ul className="space-y-3">
      <Bullet>
        <b className="text-sand">expiresIn</b> nativo: el acceso se auto-revoca por
        primitiva, no por lógica de app. Único de Arkiv.
      </Bullet>
      <Bullet>
        <b className="text-sand">Atributos consultables</b>: el coach pide solo lo
        que necesita; el payload sensible queda cifrado.
      </Bullet>
      <Bullet>
        <b className="text-sand">$creator inmutable</b>: cada lectura del coach
        queda en un registro verificable.
      </Bullet>
      <Bullet>
        <b className="text-sand">Borrado real + pruning</b>: cuando borrás, se
        elimina del estado y se poda. Y siempre fue ciphertext.
      </Bullet>
    </ul>
    <p className="text-sm text-muted">
      No IPFS (descargás todo o nada) · no Postgres (centralizado, sin
      verificabilidad).
    </p>
  </Slide>,

  // 5 — Tracks
  <Slide key="tracks" kicker="Arkiv × Puna Tech" title="Cosemos las tres verticales del track.">
    <ul className="space-y-3">
      <Bullet>
        <b className="text-sand">Memoria de IA que es tuya</b> — el contexto del
        coach vive cifrado y es propiedad del usuario.
      </Bullet>
      <Bullet>
        <b className="text-sand">Procedencia y auditoría de IA</b> — registro
        público y verificable de cada acceso del coach.
      </Bullet>
      <Bullet>
        <b className="text-sand">Capa de datos personales</b> — el usuario otorga
        y revoca permiso de lectura con un click.
      </Bullet>
    </ul>
  </Slide>,

  // 6 — Business model
  <Slide key="biz" kicker="Modelo de negocio" title="Suscripción por minutos + overage.">
    <p className="text-sm text-muted">
      Costo real: ~$0.08–0.10 / minuto de voz (95% off en silencios). El gas de
      Arkiv es despreciable.
    </p>
    <div className="overflow-hidden rounded-2xl border border-white/10 text-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-white/5 text-xs text-muted">
            <th className="px-3 py-2 text-left font-normal">Plan</th>
            <th className="px-3 py-2 text-left font-normal">Precio</th>
            <th className="px-3 py-2 text-left font-normal">Incluye</th>
            <th className="px-3 py-2 text-left font-normal">Overage</th>
          </tr>
        </thead>
        <tbody className="text-foreground/90">
          <tr className="border-t border-white/5">
            <td className="px-3 py-2 text-sand">Casual</td>
            <td className="px-3 py-2">$6.99/mes</td>
            <td className="px-3 py-2">60 min</td>
            <td className="px-3 py-2">$0.15/min</td>
          </tr>
          <tr className="border-t border-white/5">
            <td className="px-3 py-2 text-sand">Regular</td>
            <td className="px-3 py-2">$14.99/mes</td>
            <td className="px-3 py-2">180 min</td>
            <td className="px-3 py-2">$0.12/min</td>
          </tr>
          <tr className="border-t border-white/5">
            <td className="px-3 py-2 text-sand">Power</td>
            <td className="px-3 py-2">$29.99/mes</td>
            <td className="px-3 py-2">420 min</td>
            <td className="px-3 py-2">$0.10/min</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p className="text-sm text-muted">
      V2: cobro en USDC sobre Celo con fee abstraction — el usuario paga sin tocar
      gas ni tokens nativos.
    </p>
  </Slide>,

  // 7 — Roadmap & distribution
  <Slide key="roadmap" kicker="Roadmap & distribución" title="V2: el coach se vuelve un agente on-chain.">
    <ul className="space-y-3">
      <Bullet>
        <b className="text-sand">Identidad ERC-8004</b>: el coach tiene wallet
        propia y reputación verificable, derivada de los access logs de Arkiv.
      </Bullet>
      <Bullet>
        <b className="text-sand">Pagos x402 + fee abstraction</b> en Celo: pago por
        uso en USDC, sin gas nativo.
      </Bullet>
      <Bullet>
        <b className="text-sand">Distribución vía MiniPay</b>: lanzamos como
        Mini App, con acceso a <span className="text-sand">+16M de usuarios</span> —
        un caso de uso masivo para Arkiv.
      </Bullet>
    </ul>
  </Slide>,

  // 8 — Builder
  <Slide key="builder" kicker="Sobre el builder" title="Arturo Grande — Product Builder.">
    <div className="mb-4 flex items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/artugrandefounder.jpg"
        alt="Arturo Grande"
        className="h-20 w-20 rounded-full border border-sand/30 object-cover"
      />
      <p className="text-sm text-muted">
        9 hackathons ganados · podcast +250k repros · fundador de desafia.tech
      </p>
    </div>
    <ul className="space-y-3">
      <Bullet>En web3 desde 2022. Escaló una fintech de $5M a $65M USD procesados en 3 años.</Bullet>
      <Bullet>9 hackathons ganados: Celo, Polkadot, ETHGlobal, Avalanche, GenLayer, Worldcoin, Stellar.</Bullet>
      <Bullet>Podcast de tecnología con +250.000 reproducciones (Spotify + YouTube).</Bullet>
      <Bullet>Fundador de desafia.tech — educación en programación con IA.</Bullet>
    </ul>
  </Slide>,

  // 9 — Close
  <div
    key="close"
    className="flex h-full flex-col items-center justify-center text-center"
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logosusurro.svg" alt="Susurro" className="mb-6 h-20 w-auto opacity-90" />
    <h2 className="text-4xl font-semibold tracking-tight text-foreground">
      Tu confianza es tuya.
    </h2>
    <p className="mt-3 text-sand">Gracias.</p>
    <div className="mt-8 flex flex-col gap-2 text-sm">
      <a
        href="https://susurro-nine.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sand underline underline-offset-4 hover:text-foreground"
      >
        Demo en vivo → susurro-nine.vercel.app
      </a>
      <a
        href="https://github.com/artugrande/susurro"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sand underline underline-offset-4 hover:text-foreground"
      >
        Código → github.com/artugrande/susurro
      </a>
      <a
        href="https://x.com/ArtuGrande"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sand underline underline-offset-4 hover:text-foreground"
      >
        Twitter → @ArtuGrande
      </a>
    </div>
  </div>,
];

/* ---------- deck shell with navigation ---------- */

export default function Deck() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const total = slides.length;

  const next = useCallback(() => setI((v) => Math.min(v + 1, total - 1)), [total]);
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
    <main className="relative h-dvh overflow-hidden bg-background px-6 py-16">
      {/* warm background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[55rem] w-[55rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(203,185,157,0.12),_transparent_60%)]" />
      </div>

      {/* slide */}
      <div key={i} className="h-full animate-[fadeIn_0.25s_ease-out]">
        {slides[i]}
      </div>

      {/* edge nav buttons */}
      {i > 0 && (
        <button
          onClick={prev}
          aria-label="Anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-3 text-muted transition-colors hover:bg-white/5 hover:text-sand"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {i < total - 1 && (
        <button
          onClick={next}
          aria-label="Siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-3 text-muted transition-colors hover:bg-white/5 hover:text-sand"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* footer hint */}
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted/70">
        ← → para navegar · ESC vuelve al inicio
      </p>

      {/* index */}
      <p className="absolute bottom-5 right-6 font-mono text-xs text-muted">
        {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
    </main>
  );
}
