"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { useSession } from "@/lib/session";

function short(addr?: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

const primary =
  "inline-flex items-center justify-center rounded-full bg-sand px-7 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-sand/90 disabled:opacity-60";

function WalletPill({
  address,
  onClick,
}: {
  address?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title="Desconectar wallet"
      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-white/90"
    >
      <Wallet className="h-4 w-4" />
      {short(address)}
    </button>
  );
}

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
  if (!mounted) return <div className="h-12" aria-hidden />;

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
          {unlocking ? "Firmá en tu wallet…" : "Empezá a hablar con Luna"}
        </button>
        <WalletPill address={address} onClick={disconnect} />
      </div>
    );
  }

  return <WalletPill address={address} onClick={disconnect} />;
}
