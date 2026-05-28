"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { wagmiConfig } from "@/lib/wagmi";
import { SessionProvider } from "@/lib/session";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
