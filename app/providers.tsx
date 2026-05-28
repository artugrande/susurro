"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConversationProvider } from "@elevenlabs/react";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";
import { wagmiConfig } from "@/lib/wagmi";
import { SessionProvider } from "@/lib/session";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
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
    </WagmiProvider>
  );
}
