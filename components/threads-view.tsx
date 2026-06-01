"use client";

import { useT } from "@/lib/i18n";
import { computeThreads, type TagCount } from "@/lib/stats";
import type { MyEntry } from "@/lib/read";

function Chips({
  tags,
  tone,
}: {
  tags: TagCount[];
  tone: "worry" | "bright";
}) {
  const cls =
    tone === "worry"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  if (tags.length === 0)
    return <span className="text-xs text-muted">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t.tag}
          className={`rounded-full border px-2.5 py-1 text-xs ${cls}`}
        >
          {t.tag}
          {t.count > 1 && <span className="opacity-60"> ·{t.count}</span>}
        </span>
      ))}
    </div>
  );
}

export function ThreadsView({ entries }: { entries: MyEntry[] }) {
  const t = useT();
  const { worries, brights } = computeThreads(entries);
  if (worries.length === 0 && brights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="mb-2 text-xs text-muted">{t("threads.worries")}</p>
        <Chips tags={worries} tone="worry" />
      </div>
      <div>
        <p className="mb-2 text-xs text-muted">{t("threads.brights")}</p>
        <Chips tags={brights} tone="bright" />
      </div>
    </div>
  );
}
