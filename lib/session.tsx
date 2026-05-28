"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { deriveEncryptionKey, KEY_DERIVATION_MESSAGE } from "@/lib/crypto";

interface SessionState {
  address?: string;
  isConnected: boolean;
  /** True once the user signed and we derived their encryption key. */
  isUnlocked: boolean;
  encryptionKey: CryptoKey | null;
  connect: () => void;
  disconnect: () => void;
  /** Prompt the wallet to sign; derive and hold the AES key in memory. */
  unlock: () => Promise<void>;
  unlocking: boolean;
  connecting: boolean;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: connecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const doConnect = useCallback(() => {
    const connector = connectors[0];
    if (connector) connect({ connector });
  }, [connect, connectors]);

  const doDisconnect = useCallback(() => {
    setEncryptionKey(null);
    disconnect();
  }, [disconnect]);

  const unlock = useCallback(async () => {
    if (!isConnected) return;
    setUnlocking(true);
    try {
      const sig = await signMessageAsync({ message: KEY_DERIVATION_MESSAGE });
      const key = await deriveEncryptionKey(sig);
      setEncryptionKey(key);
    } finally {
      setUnlocking(false);
    }
  }, [isConnected, signMessageAsync]);

  return (
    <SessionContext.Provider
      value={{
        address,
        isConnected,
        isUnlocked: !!encryptionKey,
        encryptionKey,
        connect: doConnect,
        disconnect: doDisconnect,
        unlock,
        unlocking,
        connecting,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
