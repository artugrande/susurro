"use client";

import { useQuery } from "@tanstack/react-query";
import { queryActiveGrants } from "@/lib/entities";
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
