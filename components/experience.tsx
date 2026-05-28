"use client";

import { useSession } from "@/lib/session";
import { ConnectButton } from "@/components/connect-button";
import { Conversation } from "@/components/conversation";
import { GrantChip } from "@/components/grant-chip";
import { AuditLog } from "@/components/audit-log";
import { SeedButton } from "@/components/seed-button";

/**
 * Pre-unlock: marketing copy + connect/unlock.
 * Unlocked: the live app — grant status, the voice conversation, and the
 * public audit log.
 */
export function Experience() {
  const { isUnlocked, address } = useSession();

  if (!isUnlocked || !address) {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="max-w-xl text-pretty text-lg leading-relaxed text-sand">
          Un compañero de IA con voz que te escucha. Lo que le contás vive
          cifrado y es tuyo — no de una plataforma.
        </p>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-muted">
          Tu memoria de conversaciones vive en Arkiv. Le das acceso por el
          tiempo que vos quieras, y lo cortás cuando quieras.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <GrantChip owner={address} />
      <Conversation />
      <AuditLog owner={address} />
      <SeedButton />
    </div>
  );
}
