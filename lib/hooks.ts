"use client";

import { useQuery } from "@tanstack/react-query";
import { queryActiveGrants, queryAccessLog } from "@/lib/entities";
import { getMyEntries } from "@/lib/read";

/** The user's own entries (mood + journal), decrypted with their key. */
export function useMyEntries(owner?: string, key?: CryptoKey | null) {
  return useQuery({
    queryKey: ["myentries", owner?.toLowerCase()],
    queryFn: () => getMyEntries(owner as string, key as CryptoKey),
    enabled: !!owner && !!key,
    refetchInterval: 5000,
  });
}

/** Poll the user's active grants (Arkiv auto-expires them) every few seconds. */
export function useActiveGrants(owner?: string) {
  return useQuery({
    queryKey: ["grants", owner?.toLowerCase()],
    queryFn: () => queryActiveGrants(owner as string),
    enabled: !!owner,
    refetchInterval: 4000,
  });
}

/** Poll the public access log — verifiable record of what the coach read. */
export function useAccessLog(owner?: string) {
  return useQuery({
    queryKey: ["accesslog", owner?.toLowerCase()],
    queryFn: () => queryAccessLog(owner as string, 50),
    enabled: !!owner,
    refetchInterval: 6000,
  });
}
