"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConversationProvider } from "@elevenlabs/react";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";
import { SessionProvider } from "@/lib/session";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // Email-first onboarding — no browser extension or seed phrase needed.
        loginMethods: ["email"],
        appearance: {
          theme: "#1a1817",
          accentColor: "#cbb99d",
          logo: "/logosusurro.svg",
          landingHeader: "Entrá a Susurro",
          loginMessage: "Tu espacio privado y cifrado.",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          // Auto-create a self-custodial wallet for every new user.
          ethereum: { createOnLogin: "users-without-wallets" },
          // Sign seamlessly (no extra confirm modal) — the unlock button is the
          // explicit consent moment.
          showWalletUIs: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ConversationProvider>{children}</ConversationProvider>
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
        />
      </QueryClientProvider>
    </PrivyProvider>
  );
}
