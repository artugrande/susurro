import Link from "next/link";
import { Experience } from "@/components/experience";

export default function AppPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center px-6 text-center">
      {/* warm radial glow (fixed background) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[55rem] w-[55rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(203,185,157,0.16),_transparent_60%)]" />
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center py-16">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logosusurro.svg"
            alt="Susurro"
            className="mb-8 h-24 w-auto opacity-95 transition-opacity hover:opacity-100"
          />
        </Link>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Susurro
        </h1>

        <div className="mt-8 w-full max-w-md">
          <Experience />
        </div>
      </div>

      <footer className="w-full py-6">
        <p className="text-xs text-muted/80">
          Susurro, no reemplaza a un terapeuta profesional ·{" "}
          <Link href="/" className="underline underline-offset-2 hover:text-sand">
            inicio
          </Link>
        </p>
      </footer>
    </main>
  );
}
