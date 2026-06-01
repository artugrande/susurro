"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Tiny ES / EN toggle. Fixed top-right, visible on every page.
 *
 * Renders nothing until mounted to avoid a hydration mismatch (the
 * provider's initial server render is always `es`; the real locale
 * arrives from localStorage on the client).
 */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div aria-hidden className="fixed right-4 top-4 z-40 h-9 w-20" />;
  }

  return (
    <div
      className="fixed right-4 top-4 z-40 inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-white/5 p-1 text-xs backdrop-blur-sm"
      role="group"
      aria-label={t("lang.ariaLabel")}
    >
      <Languages
        aria-hidden
        className="ml-1.5 mr-0.5 h-3.5 w-3.5 text-muted"
      />
      <button
        onClick={() => setLocale("es")}
        aria-pressed={locale === "es"}
        className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
          locale === "es"
            ? "bg-sand text-charcoal"
            : "text-muted hover:text-foreground"
        }`}
      >
        {t("lang.toES")}
      </button>
      <button
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
          locale === "en"
            ? "bg-sand text-charcoal"
            : "text-muted hover:text-foreground"
        }`}
      >
        {t("lang.toEN")}
      </button>
    </div>
  );
}
