"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { seedDemoData } from "@/lib/seed";

type State = "idle" | "loading" | "done" | "error";

export function SeedButton() {
  const { address, encryptionKey } = useSession();
  const [state, setState] = useState<State>("idle");
  const [isDev, setIsDev] = useState(false);

  // Demo-only: hidden unless the page is opened with ?dev. Keeps the normal
  // UX clean while still allowing us to seed a realistic history for the video.
  useEffect(() => {
    setIsDev(new URLSearchParams(window.location.search).has("dev"));
  }, []);

  if (!isDev || !address || !encryptionKey) return null;

  async function run() {
    setState("loading");
    try {
      await seedDemoData({ owner: address as string, key: encryptionKey as CryptoKey });
      setState("done");
    } catch {
      setState("error");
    }
  }

  const label: Record<State, string> = {
    idle: "Cargar 14 días de datos de ejemplo",
    loading: "Cargando datos cifrados…",
    done: "✓ Datos de ejemplo cargados",
    error: "Error — reintentar",
  };

  return (
    <button
      onClick={run}
      disabled={state === "loading" || state === "done"}
      className="text-xs text-muted underline underline-offset-4 hover:text-sand disabled:no-underline"
    >
      {label[state]}
    </button>
  );
}
