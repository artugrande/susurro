"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { buildRecommendationContext } from "@/lib/stats";
import type { MyEntry } from "@/lib/read";

export function Recommendations({ entries }: { entries: MyEntry[] }) {
  const context = buildRecommendationContext(entries);
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!context) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setItems(Array.isArray(d.items) ? d.items : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [context]);

  if (!context) return null;

  function toggleDone(i: number) {
    setDone((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">Para esta semana</h3>
        <span className="inline-flex items-center gap-1.5 text-[0.6rem] text-muted">
          generado con
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vercel.svg" alt="Vercel" className="h-3 w-auto invert" />
          AI Gateway
        </span>
      </div>

      {loading && (
        <p className="text-sm text-muted">Pensando recomendaciones para vos…</p>
      )}

      {!loading && (
        <ul className="space-y-2">
          {items.map((it, i) =>
            dismissed.has(i) ? null : (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <button
                  onClick={() => toggleDone(i)}
                  aria-label="Marcar como hecho"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    done.has(i)
                      ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                      : "border-sand/40 text-transparent hover:border-sand"
                  }`}
                >
                  <Check className="h-3 w-3" />
                </button>
                <span
                  className={
                    done.has(i)
                      ? "flex-1 text-muted line-through"
                      : "flex-1 text-foreground"
                  }
                >
                  {it}
                </span>
                <button
                  onClick={() =>
                    setDismissed((prev) => new Set(prev).add(i))
                  }
                  aria-label="Descartar"
                  title="Descartar"
                  className="shrink-0 text-muted transition-colors hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
