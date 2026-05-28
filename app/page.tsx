import { ConnectButton } from "@/components/connect-button";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* warm radial glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[55rem] w-[55rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(203,185,157,0.16),_transparent_60%)]" />
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logosusurro.svg"
        alt="Susurro"
        className="mb-8 h-28 w-auto opacity-95"
      />

      <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
        Susurro
      </h1>

      <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-sand">
        Un compañero de IA con voz que te escucha. Lo que le contás vive cifrado
        y es tuyo — no de una plataforma.
      </p>

      <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted">
        Tu memoria de conversaciones vive en Arkiv. Le das acceso por el tiempo
        que vos quieras, y lo cortás cuando quieras.
      </p>

      <div className="mt-10">
        <ConnectButton />
      </div>

      <footer className="absolute inset-x-0 bottom-6 px-6">
        <p className="text-xs text-muted/80">
          Datos sintéticos · No reemplaza atención profesional · Construido sobre
          Arkiv + ElevenLabs
        </p>
      </footer>
    </main>
  );
}
