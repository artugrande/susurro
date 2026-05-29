"use client";

import { useEffect, useState } from "react";
import { Wallet, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/session";

function short(addr?: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

const primary =
  "inline-flex items-center justify-center rounded-full bg-sand px-7 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-sand/90 disabled:opacity-60";

function AccountPill({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title="Ver mi cuenta"
      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-charcoal transition-colors hover:bg-white/90"
    >
      <Wallet className="h-4 w-4" />
      {label}
    </button>
  );
}

function AccountModal({
  email,
  address,
  onClose,
  onLogout,
}: {
  email?: string;
  address?: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-3xl border border-sand/20 bg-charcoal p-6 text-center shadow-2xl animate-[popIn_0.18s_ease-out]">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sand/15 text-sand">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          Estás conectado a esta cuenta
        </h3>
        {email && (
          <p className="mt-1 text-sm font-medium text-foreground">{email}</p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Tu espacio está cifrado y solo vos podés leerlo. Tu wallet es
          self-custodial — la creaste vos, no una plataforma.
        </p>
        {address && (
          <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-muted">
            {short(address)}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-full bg-red-500/90 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-500"
          >
            Cerrar sesión
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            Seguir conectado
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const {
    ready,
    isConnected,
    isUnlocked,
    address,
    email,
    connect,
    disconnect,
    unlock,
    unlocking,
  } = useSession();

  useEffect(() => setMounted(true), []);

  // Avoid SSR/client hydration mismatch — auth state is client-only.
  if (!mounted) return <div className="h-12" aria-hidden />;

  const pillLabel = email ?? short(address);

  function handleLogout() {
    setAccountOpen(false);
    disconnect();
    toast.success("Te deslogueaste correctamente.");
  }

  const modal = accountOpen ? (
    <AccountModal
      email={email}
      address={address}
      onClose={() => setAccountOpen(false)}
      onLogout={handleLogout}
    />
  ) : null;

  if (!isConnected) {
    return (
      <button onClick={connect} disabled={!ready} className={primary}>
        {!ready ? "Cargando…" : "Ingresá con tu email"}
      </button>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button onClick={unlock} disabled={unlocking} className={primary}>
          {unlocking ? "Cifrando tu espacio…" : "Empezá a hablar con Luna"}
        </button>
        <AccountPill label={pillLabel} onClick={() => setAccountOpen(true)} />
        {modal}
      </div>
    );
  }

  return (
    <>
      <AccountPill label={pillLabel} onClick={() => setAccountOpen(true)} />
      {modal}
    </>
  );
}
