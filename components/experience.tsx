"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/session";
import { getMyEntries } from "@/lib/read";
import { seedDemoData } from "@/lib/seed";
import { ConnectButton } from "@/components/connect-button";
import { Conversation } from "@/components/conversation";
import { GrantChip } from "@/components/grant-chip";
import { MyData } from "@/components/my-data";
import { SeedButton } from "@/components/seed-button";

export function Experience() {
  const { isUnlocked, address, encryptionKey, demoMode, enterDemo, exitDemo } =
    useSession();
  const qc = useQueryClient();
  const seededRef = useRef(false);

  // Auto-enter demo mode when the page is opened with ?demo.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const wantsDemo = new URLSearchParams(window.location.search).has("demo");
    if (wantsDemo && !demoMode && !isUnlocked) void enterDemo();
  }, [demoMode, isUnlocked, enterDemo]);

  // In demo mode, seed the fictional Salta-dev data once if it isn't there yet.
  useEffect(() => {
    if (!demoMode || !address || !encryptionKey || seededRef.current) return;
    seededRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const existing = await getMyEntries(address, encryptionKey);
        if (!cancelled && existing.length === 0) {
          await seedDemoData({ owner: address, key: encryptionKey });
          await qc.invalidateQueries({
            queryKey: ["myentries", address.toLowerCase()],
          });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [demoMode, address, encryptionKey, qc]);

  if (!isUnlocked || !address) {
    return (
      <div className="flex flex-col items-center gap-6 animate-[floatIn_0.6s_ease-out]">
        <p className="max-w-xl text-pretty text-lg leading-relaxed text-sand">
          Un compañero de IA con voz que te escucha. Lo que le contás vive
          cifrado y es tuyo — no de una plataforma.
        </p>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-muted">
          Tu memoria de conversaciones vive en Arkiv. Le das acceso por el
          tiempo que vos quieras, y lo cortás cuando quieras.
        </p>
        <ConnectButton />
        <button
          onClick={() => void enterDemo()}
          className="text-xs text-muted underline underline-offset-4 hover:text-sand"
        >
          Entrar como invitado
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 animate-[floatIn_0.5s_ease-out]">
      {demoMode && (
        <div className="text-xs text-muted">
          Cuenta de invitado ·{" "}
          <button
            onClick={exitDemo}
            className="text-sand underline underline-offset-4"
          >
            salir
          </button>
        </div>
      )}
      <GrantChip owner={address} />
      <Conversation />
      <MyData owner={address} />
      <SeedButton />
    </div>
  );
}
