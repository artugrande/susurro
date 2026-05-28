"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/session";
import { useMyEntries } from "@/lib/hooks";
import { deleteEntity, deleteAllData } from "@/lib/write";
import { EntityType } from "@/lib/arkiv";
import type { MyEntry } from "@/lib/read";
import { AuditLog } from "@/components/audit-log";

export function MyData({ owner }: { owner: string }) {
  const { encryptionKey } = useSession();
  const { data: entries } = useMyEntries(owner, encryptionKey);
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [wiping, setWiping] = useState(false);

  const list = entries ?? [];

  async function removeOne(e: MyEntry) {
    setBusy(e.entityKey);
    try {
      await deleteEntity({
        entityKey: e.entityKey,
        owner,
        entityType: e.type === "mood" ? EntityType.Mood : EntityType.Journal,
      });
      await qc.invalidateQueries({ queryKey: ["myentries", owner.toLowerCase()] });
    } finally {
      setBusy(null);
    }
  }

  async function wipeAll() {
    if (
      !window.confirm(
        "¿Eliminar TODA tu data y cortar todo acceso? No se puede deshacer.",
      )
    )
      return;
    setWiping(true);
    try {
      await deleteAllData({ owner });
      await qc.invalidateQueries({ queryKey: ["myentries", owner.toLowerCase()] });
      await qc.invalidateQueries({ queryKey: ["grants", owner.toLowerCase()] });
    } finally {
      setWiping(false);
    }
  }

  return (
    <div className="w-full text-left">
      <h2 className="text-sm font-medium text-foreground">Mis registros</h2>
      <p className="mb-3 text-xs text-muted">
        Cifrados con tu llave. Solo vos podés leerlos.
      </p>

      {list.length === 0 ? (
        <p className="text-sm text-muted">
          Todavía no guardaste nada. Hablá con Susurro y lo que registres
          aparece acá.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-xs text-muted">
                <th className="px-3 py-2 text-left font-normal">Ánimo</th>
                <th className="px-3 py-2 text-left font-normal">
                  Qué compartiste
                </th>
                <th className="px-3 py-2 text-right font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.entityKey} className="border-t border-white/5">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-sand">
                    {e.mood ? `${e.mood}/10` : "—"}
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    {e.type === "journal" && <span className="mr-1">📔</span>}
                    {e.summary || (
                      <span className="text-muted">(sin nota)</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => removeOne(e)}
                      disabled={busy === e.entityKey}
                      title="Eliminar este registro"
                      className="text-muted transition-colors hover:text-red-400 disabled:opacity-50"
                    >
                      {busy === e.entityKey ? "…" : "🗑"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {list.length > 0 && (
        <button
          onClick={wipeAll}
          disabled={wiping}
          className="mt-3 text-xs text-red-400 underline underline-offset-4 hover:text-red-300 disabled:opacity-50"
        >
          {wiping
            ? "Eliminando todo…"
            : "🔴 Eliminar todo y revocar el acceso"}
        </button>
      )}

      <div className="mt-4 border-t border-white/5 pt-3">
        <AuditLog owner={owner} />
      </div>
    </div>
  );
}
