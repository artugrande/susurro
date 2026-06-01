"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Flame } from "lucide-react";
import { useSession } from "@/lib/session";
import { useMyEntries } from "@/lib/hooks";
import { deleteEntity, deleteAllData } from "@/lib/write";
import { EntityType, APP_WALLET_ADDRESS } from "@/lib/arkiv";
import { computeStats } from "@/lib/stats";
import { useT } from "@/lib/i18n";
import type { MyEntry } from "@/lib/read";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MoodTimeline } from "@/components/mood-timeline";
import { WeeklyRecap } from "@/components/weekly-recap";
import { ThreadsView } from "@/components/threads-view";
import { Recommendations } from "@/components/recommendations";

export function MyData({ owner }: { owner: string }) {
  const t = useT();
  const { encryptionKey } = useSession();
  const { data: entries } = useMyEntries(owner, encryptionKey);
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [wiping, setWiping] = useState(false);

  const list = (entries ?? []).filter((e) => !hidden.has(e.entityKey));
  const stats = computeStats(list);

  async function removeOne(e: MyEntry) {
    setBusy(e.entityKey);
    try {
      await deleteEntity({
        entityKey: e.entityKey,
        owner,
        entityType: e.type === "mood" ? EntityType.Mood : EntityType.Journal,
      });
      setHidden((prev) => new Set(prev).add(e.entityKey));
      toast.success(t("mydata.toastRowDeleted"));
      await qc.invalidateQueries({ queryKey: ["myentries", owner.toLowerCase()] });
    } catch {
      toast.error(t("mydata.toastRowDeleteFail"));
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
          ? t("mydata.toastAllDeleted", {
              n: deleted,
              label: deleted === 1 ? t("mydata.entryOne") : t("mydata.entryMany"),
            })
          : t("mydata.toastAllNothing"),
      );
      await qc.invalidateQueries({ queryKey: ["myentries", owner.toLowerCase()] });
      await qc.invalidateQueries({ queryKey: ["grants", owner.toLowerCase()] });
      setConfirmOpen(false);
    } catch {
      toast.error(t("mydata.toastAllFail"));
    } finally {
      setWiping(false);
    }
  }

  return (
    <div className="w-full space-y-5 text-left">
      {list.length > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-3">
            <div className="flex items-center justify-center gap-1 text-lg font-semibold text-sand">
              <Flame className="h-4 w-4" />
              {stats.streak}
            </div>
            <div className="text-[0.65rem] text-muted">
              {stats.streak === 1 ? t("stats.dayInRow") : t("stats.daysInRow")}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-3">
            <div className="text-lg font-semibold text-foreground">
              {stats.total}
            </div>
            <div className="text-[0.65rem] text-muted">{t("stats.entries")}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-3">
            <div className="text-lg font-semibold text-foreground">
              {stats.todayDone ? "✓" : "—"}
            </div>
            <div className="text-[0.65rem] text-muted">{t("stats.today")}</div>
          </div>
        </div>
      )}

      <WeeklyRecap entries={list} />

      <MoodTimeline entries={list} />

      <div>
        <h2 className="text-sm font-medium text-foreground">{t("mydata.header")}</h2>
        <p className="mb-3 text-xs text-muted">{t("mydata.sub")}</p>

        {list.length === 0 ? (
          <p className="text-sm text-muted">{t("mydata.empty")}</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/5 text-xs text-muted">
                  <th className="px-3 py-2 text-left font-normal">{t("mydata.colMood")}</th>
                  <th className="px-3 py-2 text-left font-normal">
                    {t("mydata.colShared")}
                  </th>
                  <th className="px-3 py-2 text-right font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {list.map((e) => (
                  <tr
                    key={e.entityKey}
                    className={[
                      "border-t border-white/5 align-top transition-all duration-300",
                      busy === e.entityKey ? "opacity-30" : "opacity-100",
                    ].join(" ")}
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-sand">
                      {e.mood ? `${e.mood}/10` : "—"}
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {e.type === "journal" && <span className="mr-1">📔</span>}
                      {e.summary || (
                        <span className="text-muted">{t("mydata.noNote")}</span>
                      )}
                      {e.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {e.tags.map((tg) => (
                            <span
                              key={tg}
                              className="rounded-full border border-sand/20 px-2 py-0.5 text-[0.65rem] text-sand/80"
                            >
                              {tg}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => removeOne(e)}
                        disabled={busy === e.entityKey}
                        title={t("mydata.deleteRow")}
                        aria-label={t("mydata.deleteRow")}
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
            {t("mydata.deleteAll")}
          </button>
        )}
      </div>

      <ThreadsView entries={list} />

      <Recommendations entries={list} />

      <div className="border-t border-white/5 pt-3 text-xs leading-relaxed text-muted">
        {t("mydata.explorerNote")}
        {APP_WALLET_ADDRESS && (
          <a
            href={`https://explorer.braga.hoodi.arkiv.network/address/${APP_WALLET_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sand underline underline-offset-4 hover:text-foreground"
          >
            {t("mydata.explorerLink")}
          </a>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("mydata.confirmTitle")}
        description={t("mydata.confirmDesc")}
        confirmLabel={t("mydata.confirmYes")}
        cancelLabel={t("mydata.confirmCancel")}
        loadingLabel={t("mydata.confirmDeleting")}
        danger
        loading={wiping}
        onConfirm={wipeAll}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
