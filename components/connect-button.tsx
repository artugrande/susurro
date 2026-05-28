"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";

function short(addr?: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

const btn =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors";
const primary = `${btn} bg-sand text-charcoal hover:bg-sand/90`;
const ghost = `${btn} border border-sand/30 text-sand hover:bg-sand/10`;

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);
  const {
    isConnected,
    isUnlocked,
    address,
    connect,
    disconnect,
    unlock,
    unlocking,
    connecting,
  } = useSession();

  useEffect(() => setMounted(true), []);

  // Avoid SSR/client hydration mismatch — wallet state is client-only.
  if (!mounted) {
    return <div className="h-12" aria-hidden />;
  }

  if (!isConnected) {
    return (
      <button onClick={connect} disabled={connecting} className={primary}>
        {connecting ? "Conectando…" : "Conectar wallet"}
      </button>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button onClick={unlock} disabled={unlocking} className={primary}>
          {unlocking ? "Firmá en tu wallet…" : "Desbloquear mi espacio"}
        </button>
        <button onClick={disconnect} className="text-xs text-muted underline">
          Desconectar {short(address)}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="inline-flex items-center gap-2 rounded-full border border-sand/30 px-4 py-2 text-sm text-sand">
        🔓 Espacio desbloqueado · {short(address)}
      </span>
      <button onClick={disconnect} className="text-xs text-muted underline">
        Cerrar sesión
      </button>
    </div>
  );
}
