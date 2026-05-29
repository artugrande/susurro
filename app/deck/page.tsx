"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PresenceBlob } from "@/components/presence-blob";

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

function Stat({
  big,
  label,
  small,
  href,
}: {
  big: string;
  label?: string;
  small: string;
  href?: string;
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
              fuente
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

/* ---------- slides ---------- */

const slides: ReactNode[] = [
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/vercellogo.png" alt="Vercel" className="h-4 w-auto" />
    </div>
    <p className="mt-3 text-xs text-muted/70">Puna Tech 2026</p>
  </div>,

  // 1 — Salta / loneliness
  <Slide key="salta" kicker="Por qué importa" title="Salta tiene una de las tasas de suicidio más altas de Argentina.">
    <div className="grid gap-4 sm:grid-cols-2">
      <Stat
        big="2×"
        small="Salta duplica el promedio nacional: 13,5 vs 6,7 suicidios por 100.000 hab."
        href="https://www.pagina12.com.ar/782016-salta-duplica-el-promedio-nacional-de-suicidios/"
      />
      <Stat
        big="65%"
        small="De los intentos en la provincia son jóvenes de 19 a 29 años"
        href="https://www.ahorasalta.com.ar/noticias/salud-17/salta-es-una-de-las-provincias-del-pais-con-mayor-cantidad-de-suicidios-12228"
      />
    </div>
    <ul className="space-y-3">
      <Bullet>
        La <span className="text-sand">soledad y el aislamiento social</span> son
        factores de riesgo reconocidos — la OMS declaró la soledad una amenaza
        para la salud global (2023).
      </Bullet>
      <Bullet>
        Falta un espacio íntimo, sin juicio y disponible siempre para hablar de
        cómo uno se siente.
      </Bullet>
    </ul>
  </Slide>,

  // 2 — Problem
  <Slide key="problem" kicker="El problema" title="La gente ya usa la IA como terapeuta. Pero tiene que elegir: privacidad o memoria.">
    <div className="grid gap-4 sm:grid-cols-2">
      <Stat
        big="#1"
        label="Terapia y compañía"
        small="Uso de IA generativa en 2025 (Harvard Business Review)"
        href="https://hbr.org/2025/04/how-people-are-really-using-gen-ai-in-2025"
      />
      <Stat
        big="−30%"
        small="Hacer journaling a diario baja los síntomas de depresión en 8 semanas (escritura expresiva)"
        href="https://www.simplypsychology.com/articles/journaling-for-mental-health"
      />
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
      ElevenLabs recibe y transcribe tu audio
      <br />→ se cifra en tu navegador
      <br />→ Arkiv guarda el dato (la app paga el gas fee, vos no)
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
  </Slide>,

  // 5 — Tracks
  <Slide key="tracks" kicker="Arkiv × Puna Tech" title="Unimos las tres verticales del track.">
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
  <Slide key="biz" kicker="Modelo de negocio" title="El plan cubre el costo de voz y deja ganancia desde el día cero.">
    <p className="text-sm text-muted">
      El único costo real es la voz: ~$0.06 por minuto (con 95% off en los
      silencios de una charla reflexiva).
    </p>
    <div className="overflow-hidden rounded-2xl border border-white/10 text-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-white/5 text-xs text-muted">
            <th className="px-3 py-2 text-left font-normal">Plan</th>
            <th className="px-3 py-2 text-left font-normal">Uso</th>
            <th className="px-3 py-2 text-left font-normal">Precio</th>
            <th className="px-3 py-2 text-left font-normal">Costo voz</th>
            <th className="px-3 py-2 text-left font-normal">Ganancia</th>
          </tr>
        </thead>
        <tbody className="text-foreground/90">
          <tr className="border-t border-white/5">
            <td className="px-3 py-2 text-sand">Casual</td>
            <td className="px-3 py-2">~2 min/día</td>
            <td className="px-3 py-2">$6.99</td>
            <td className="px-3 py-2 text-muted">$3.60</td>
            <td className="px-3 py-2 text-emerald-300">+$3.39</td>
          </tr>
          <tr className="border-t border-white/5">
            <td className="px-3 py-2 text-sand">Regular</td>
            <td className="px-3 py-2">~6 min/día</td>
            <td className="px-3 py-2">$14.99</td>
            <td className="px-3 py-2 text-muted">$10.80</td>
            <td className="px-3 py-2 text-emerald-300">+$4.19</td>
          </tr>
          <tr className="border-t border-white/5">
            <td className="px-3 py-2 text-sand">Power</td>
            <td className="px-3 py-2">~14 min/día</td>
            <td className="px-3 py-2">$29.99</td>
            <td className="px-3 py-2 text-muted">$25.20</td>
            <td className="px-3 py-2 text-emerald-300">+$4.79</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p className="text-sm text-muted">
      Cada usuario que paga su plan cubre sus minutos de ElevenLabs y deja margen.
      Rentable por usuario desde el primer mes.
    </p>
  </Slide>,

  // 7 — Roadmap & distribution
  <Slide key="roadmap" kicker="V2 · Roadmap" title="V2: empezamos a cobrar por uso, sobre Celo.">
    <ul className="space-y-3">
      <Bullet>
        <b className="text-sand">Pagos por uso en USDT sobre Celo</b> (x402 + fee
        abstraction): el usuario paga sin tocar gas ni tokens nativos.
      </Bullet>
      <Bullet>
        <b className="text-sand">Distribución vía MiniPay</b>: lanzamos como Mini
        App, con acceso a <span className="text-sand">+16M de usuarios</span> — un
        caso de uso masivo para Arkiv.
      </Bullet>
      <Bullet>
        <b className="text-sand">Identidad ERC-8004 del coach:</b> wallet propia +
        reputación verificable derivada de los access logs de Arkiv.
      </Bullet>
    </ul>
    <div className="mt-2 flex items-center gap-5 opacity-80">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/celologo.png" alt="Celo" className="h-6 w-auto" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/minipaylogo.png" alt="MiniPay" className="h-6 w-auto" />
    </div>
  </Slide>,

  // 8 — Builder
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
          Sobre el builder
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Arturo Grande — Product Builder.
        </h2>
      </div>
    </div>
    <ul className="mt-6 space-y-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
      <Bullet>
        Salteño. Escaló una fintech de $5M a $65M USD procesados en 3 años.
      </Bullet>
      <Bullet>
        Lanzó una Mini App web3 con{" "}
        <b className="text-sand">+1.000 usuarios en 40 países</b>.
      </Bullet>
      <Bullet>
        9 hackathons ganados: Celo, Polkadot, ETHGlobal, Avalanche, GenLayer,
        Worldcoin, Stellar.
      </Bullet>
      <Bullet>
        Podcast de tecnología +250k reproducciones · fundador de desafia.tech.
      </Bullet>
    </ul>
  </div>,

  // 9 — Close
  <div
    key="close"
    className="flex h-full flex-col items-center justify-center text-center"
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logosusurro.svg" alt="Susurro" className="mb-6 h-20 w-auto opacity-90" />
    <h2 className="text-4xl font-semibold tracking-tight text-foreground">
      Tu registro emocional es tuyo.
    </h2>
    <p className="mt-3 text-sand">Gracias por tu atención.</p>
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
