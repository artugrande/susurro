"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useActiveGrants } from "@/lib/hooks";
import { revokeGrant } from "@/lib/write";
import { useT } from "@/lib/i18n";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function GrantChip({ owner }: { owner: string }) {
  const t = useT();
  const { data: grants } = useActiveGrants(owner);
  const qc = useQueryClient();
  const [now, setNow] = useState(() => Date.now());
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    const tid = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tid);
  }, []);

  const SCOPE_LABEL: Record<string, string> = {
    "mood-checkin": t("grant.scopeMood"),
    "journal-entry": t("grant.scopeJournal"),
    "coach-insight": t("grant.scopeInsight"),
  };

  const active = (grants ?? []).filter(
    (g) => Number(g.attributes.expiresAt ?? 0) > now,
  );

  async function cut(entityKey: string) {
    setRevoking(entityKey);
    try {
      await revokeGrant({ entityKey, owner });
      await qc.invalidateQueries({ queryKey: ["grants", owner.toLowerCase()] });
    } finally {
      setRevoking(null);
    }
  }

  if (active.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      {active.map((g) => {
        const remaining = Number(g.attributes.expiresAt ?? 0) - now;
        const scopes = String(g.attributes.scope ?? "")
          .split(",")
          .filter(Boolean)
          .map((s) => SCOPE_LABEL[s] ?? s);
        return (
          <div
            key={g.entityKey}
            className="rounded-2xl border border-sand/30 bg-sand/5 p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-sand">
              <span className="h-2 w-2 animate-pulse rounded-full bg-sand" />
              {t("grant.open")}
            </div>
            <p className="mt-1 text-xs text-muted">
              {t("grant.canRead")}
              {scopes.join(" · ")}
            </p>
            <p className="mt-2 font-mono text-lg text-foreground">
              ⏱ {formatRemaining(remaining)}
            </p>
            <button
              onClick={() => cut(g.entityKey)}
              disabled={revoking === g.entityKey}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-red-500/90 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60"
            >
              {revoking === g.entityKey ? t("grant.cutting") : t("grant.cutNow")}
            </button>
          </div>
        );
      })}
    </div>
  );
}
