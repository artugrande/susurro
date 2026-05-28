"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useSession } from "@/lib/session";
import { useMyEntries } from "@/lib/hooks";
import { deleteEntity, deleteAllData } from "@/lib/write";
import { EntityType, APP_WALLET_ADDRESS } from "@/lib/arkiv";
import type { MyEntry } from "@/lib/read";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MoodTimeline } from "@/components/mood-timeline";

export function MyData({ owner }: { owner: string }) {
  const { encryptionKey } = useSession();
  const { data: entries } = useMyEntries(owner, encryptionKey);
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [wiping, setWiping] = useState(false);

  const list = (entries ?? []).filter((e) => !hidden.has(e.entityKey));

  async function removeOne(e: MyEntry) {
    setBusy(e.entityKey);
    try {
      await deleteEntity({
        entityKey: e.entityKey,
        owner,
        entityType: e.type === "mood" ? EntityType.Mood : EntityType.Journal,
      });
      setHidden((prev) => new Set(prev).add(e.entityKey));
      toast.success("Registro eliminado de Arkiv");
      await qc.invalidateQueries({ queryKey: ["myentries", owner.toLowerCase()] });
    } catch {
      toast.error("No se pudo eliminar. Reintentá.");
    } finally {
      setBusy(null);
    }
  }

  async function wipeAll() {
    setWiping(true);
    try {
      const { deleted } = await deleteAllData({ owner });
      setHidden(new Set((entries ?? []).map((e) => e.entityKey)));
      toast.success(
        deleted > 0
          ? `Eliminé todo: ${deleted} registro(s) y accesos`
          : "No quedaba nada para eliminar",
      );
      await qc.invalidateQueries({ queryKey: ["myentries", owner.toLowerCase()] });
      await qc.invalidateQueries({ queryKey: ["grants", owner.toLowerCase()] });
      setConfirmOpen(false);
    } catch {
      toast.error("No se pudo eliminar todo. Reintentá.");
    } finally {
      setWiping(false);
    }
  }

  return (
    <div className="w-full text-left">
      <MoodTimeline entries={entries ?? []} />

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
                <tr
                  key={e.entityKey}
                  className={[
                    "border-t border-white/5 transition-all duration-300",
                    busy === e.entityKey ? "opacity-30" : "opacity-100",
                  ].join(" ")}
                >
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
                      aria-label="Eliminar este registro"
                      className="inline-flex text-muted transition-colors hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
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
          onClick={() => setConfirmOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-red-400 transition-colors hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar todo y revocar el acceso
        </button>
      )}

      <div className="mt-4 border-t border-white/5 pt-3 text-xs leading-relaxed text-muted">
        🔒 Cada registro vive cifrado en Arkiv (testnet BRAGA) — solo tu wallet
        puede descifrarlo. Cada vez que guardás algo, es una transacción real
        on-chain.{" "}
        {APP_WALLET_ADDRESS && (
          <a
            href={`https://explorer.braga.hoodi.arkiv.network/address/${APP_WALLET_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sand underline underline-offset-4 hover:text-foreground"
          >
            Ver las transacciones de Susurro en Arkiv ↗
          </a>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar todo?"
        description="Se borran todos tus registros y se corta cualquier acceso de Susurro. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar todo"
        danger
        loading={wiping}
        onConfirm={wipeAll}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
