"use client";

import { useSession } from "@/lib/session";
import { ConnectButton } from "@/components/connect-button";
import { Conversation } from "@/components/conversation";

/**
 * Switches the hero CTA between wallet connect/unlock and the live
 * conversation, depending on whether the user's space is unlocked.
 */
export function Experience() {
  const { isUnlocked } = useSession();
  return isUnlocked ? <Conversation /> : <ConnectButton />;
}
