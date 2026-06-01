"use client";

import { useSession } from "@/lib/session";
import { ConnectButton } from "@/components/connect-button";
import { Conversation } from "@/components/conversation";
import { GrantChip } from "@/components/grant-chip";
import { MyData } from "@/components/my-data";
import { SeedButton } from "@/components/seed-button";
import { useT } from "@/lib/i18n";

export function Experience() {
  const t = useT();
  const { isUnlocked, address } = useSession();

  if (!isUnlocked || !address) {
    return (
      <div className="flex flex-col items-center gap-6 animate-[floatIn_0.6s_ease-out]">
        <p className="max-w-xl text-pretty text-lg leading-relaxed text-sand">
          {t("experience.tagline1")}
        </p>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-muted">
          {t("experience.tagline2")}
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 animate-[floatIn_0.5s_ease-out]">
      {/* Account pill (email + logout) — always reachable while you're in. */}
      <div className="flex w-full justify-center">
        <ConnectButton />
      </div>
      <GrantChip owner={address} />
      <Conversation />
      <MyData owner={address} />
      <SeedButton />
    </div>
  );
}
