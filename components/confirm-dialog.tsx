"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  danger,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={() => !loading && onCancel()}
      />
      {/* card */}
      <div className="relative w-full max-w-sm rounded-3xl border border-sand/20 bg-charcoal p-6 text-center shadow-2xl animate-[popIn_0.18s_ease-out]">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={[
              "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors disabled:opacity-60",
              danger
                ? "bg-red-500/90 text-white hover:bg-red-500"
                : "bg-sand text-charcoal hover:bg-sand/90",
            ].join(" ")}
          >
            {loading ? "Eliminando…" : confirmLabel}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-60"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
