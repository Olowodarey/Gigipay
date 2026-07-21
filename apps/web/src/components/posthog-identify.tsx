"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import posthog from "posthog-js";

/**
 * Ties PostHog analytics to the connected wallet so DAU/MAU count distinct
 * wallets (not browsers). Identifies on connect, resets on disconnect. Must be
 * mounted inside the wagmi provider. No-ops when PostHog isn't initialised.
 */
export function PostHogIdentify() {
  const { address, isConnected } = useAccount();
  const identified = useRef<string | null>(null);

  useEffect(() => {
    if (!posthog.__loaded) return;
    if (isConnected && address) {
      const id = address.toLowerCase();
      if (identified.current === id) return;
      identified.current = id;
      posthog.identify(id);
    } else if (identified.current) {
      identified.current = null;
      posthog.reset();
    }
  }, [address, isConnected]);

  return null;
}
