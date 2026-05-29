"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePrivy, useWallets, useSignMessage } from "@privy-io/react-auth";
import { deriveEncryptionKey, KEY_DERIVATION_MESSAGE } from "@/lib/crypto";

interface SessionState {
  address?: string;
  /** Email the user logged in with, if any (friendlier than an address). */
  email?: string;
  /** Privy finished initializing (auth state is known). */
  ready: boolean;
  isConnected: boolean;
  /** True once the user signed and we derived their encryption key. */
  isUnlocked: boolean;
  encryptionKey: CryptoKey | null;
  /** Open the Privy login modal (email → auto-created embedded wallet). */
  connect: () => void;
  disconnect: () => void;
  /** Sign the key-derivation message; derive and hold the AES key in memory. */
  unlock: () => Promise<void>;
  unlocking: boolean;
  connecting: boolean;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  // Prefer the Privy embedded wallet; fall back to any connected wallet.
  const wallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy") ?? wallets[0],
    [wallets],
  );
  const address = wallet?.address;
  const email = user?.email?.address;
  const isConnected = authenticated && !!address;

  const doConnect = useCallback(() => {
    login();
  }, [login]);

  const doDisconnect = useCallback(() => {
    setEncryptionKey(null);
    void logout();
  }, [logout]);

  const unlock = useCallback(async () => {
    if (!address) return;
    setUnlocking(true);
    try {
      const { signature } = await signMessage(
        { message: KEY_DERIVATION_MESSAGE },
        { address },
      );
      const key = await deriveEncryptionKey(signature);
      setEncryptionKey(key);
    } finally {
      setUnlocking(false);
    }
  }, [address, signMessage]);

  return (
    <SessionContext.Provider
      value={{
        address,
        email,
        ready,
        isConnected,
        isUnlocked: !!encryptionKey,
        encryptionKey,
        connect: doConnect,
        disconnect: doDisconnect,
        unlock,
        unlocking,
        connecting: !ready,
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
