"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConversationProvider } from "@elevenlabs/react";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";
import { SessionProvider } from "@/lib/session";
import { LocaleProvider, useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

/** Inner tree that depends on the active locale (Privy modal copy + everything below). */
function LocalizedTree({ children }: { children: ReactNode }) {
  const { locale, t } = useI18n();
  const [queryClient] = useState(() => new QueryClient());

  return (
    // key={locale} remounts the Privy SDK on language change so its config
    // (login modal headline / message) re-renders in the new locale.
    // Privy's auth state persists outside React, so the remount is silent.
    <PrivyProvider
      key={locale}
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "#1a1817",
          accentColor: "#cbb99d",
          logo: "/logosusurro.svg",
          landingHeader: locale === "en" ? "Sign in to Susurro" : "Entrá a Susurro",
          loginMessage:
            locale === "en"
              ? "Your private, encrypted space."
              : "Tu espacio privado y cifrado.",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          showWalletUIs: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ConversationProvider>
            <LanguageSwitcher />
            {children}
          </ConversationProvider>
        </SessionProvider>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "#232222",
              border: "1px solid rgba(203,185,157,0.25)",
              color: "#ede7dd",
            },
          }}
          // Wrap the toast text in the active locale via aria — toasts here
          // are already produced by components that read useT().
          aria-label={t("lang.ariaLabel")}
        />
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <LocalizedTree>{children}</LocalizedTree>
    </LocaleProvider>
  );
}
