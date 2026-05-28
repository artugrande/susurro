"use client";

import dynamic from "next/dynamic";
import type { BlobState } from "./presence-blob/states";

export type { BlobState };

// WebGL must run client-side only.
const BlobCanvas = dynamic(() => import("./presence-blob/blob-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-3 w-3 animate-pulse rounded-full bg-sand/50" />
    </div>
  ),
});

export function PresenceBlob({
  state = "idle",
  pulseSeed = 0,
  className,
}: {
  state?: BlobState;
  pulseSeed?: number;
  className?: string;
}) {
  return (
    <div className={className ?? "h-full w-full"}>
      <BlobCanvas state={state} pulseSeed={pulseSeed} />
    </div>
  );
}
