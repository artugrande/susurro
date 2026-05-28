"use client";

import { useState } from "react";
import { useAccessLog } from "@/lib/hooks";

const ACTION_LABEL: Record<string, string> = {
  recall_mood: "consultó tu ánimo",
  recall_journal: "consultó tu diario",
};

export function AuditLog({ owner }: { owner: string }) {
  const [open, setOpen] = useState(false);
  const { data: logs } = useAccessLog(owner);
  const entries = logs ?? [];

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-muted underline underline-offset-4 hover:text-sand"
      >
        🔒 Registro de accesos de Susurro ({entries.length})
      </button>

      {open && (
        <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
          <p className="text-xs text-muted">
            Nadie más que vos puede leer tu contenido — sigue cifrado. Acá queda
            registrado, de forma verificable, cada vez que Susurro accedió con tu
            permiso. Es la prueba de que el acceso fue solo el que autorizaste.
          </p>
          {entries.length === 0 ? (
            <p className="text-sm text-muted">
              Susurro todavía no accedió a tu data.
            </p>
          ) : (
            <ul className="space-y-2">
              {entries.map((e) => {
                let description = "";
                try {
                  description =
                    (JSON.parse(e.payload) as { description?: string })
                      .description ?? "";
                } catch {
                  /* ignore */
                }
                const action = String(e.attributes.action ?? "");
                const when = new Date(
                  Number(e.attributes.created ?? 0),
                ).toLocaleString("es-AR");
                return (
                  <li
                    key={e.entityKey}
                    className="border-b border-white/5 pb-2 text-sm text-foreground last:border-0"
                  >
                    <span className="text-sand">📖 {ACTION_LABEL[action] ?? action}</span>
                    <span className="text-muted"> · {when}</span>
                    {description && (
                      <div className="text-xs text-muted">{description}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <a
            href="https://data.arkiv.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block pt-1 text-xs text-sand underline underline-offset-4"
          >
            Verificar en el explorador de Arkiv ↗
          </a>
        </div>
      )}
    </div>
  );
}
