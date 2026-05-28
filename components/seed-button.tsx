"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/session";
import { seedDemoData } from "@/lib/seed";

type State = "idle" | "loading" | "done" | "error";

export function SeedButton() {
  const { address, encryptionKey } = useSession();
  const qc = useQueryClient();
  const [state, setState] = useState<State>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isDev, setIsDev] = useState(false);

  // Demo-only: hidden unless the page is opened with ?dev.
  useEffect(() => {
    setIsDev(new URLSearchParams(window.location.search).has("dev"));
  }, []);

  if (!isDev || !address || !encryptionKey) return null;

  async function run() {
    setState("loading");
    try {
      const r = await seedDemoData({
        owner: address as string,
        key: encryptionKey as CryptoKey,
      });
      setTxHash(r.txHash ?? null);
      await qc.invalidateQueries({
        queryKey: ["myentries", (address as string).toLowerCase()],
      });
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
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={run}
        disabled={state === "loading" || state === "done"}
        className="text-xs text-muted underline underline-offset-4 hover:text-sand disabled:no-underline"
      >
        {label[state]}
      </button>
      {state === "done" && txHash && (
        <a
          href={`https://explorer.braga.hoodi.arkiv.network/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sand underline underline-offset-4 hover:text-foreground"
        >
          Ver la transacción en Arkiv ↗
        </a>
      )}
    </div>
  );
}
