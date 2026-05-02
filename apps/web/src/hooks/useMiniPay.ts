"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";

/**
 * Detects if the app is running inside the MiniPay browser
 * and auto-connects the injected wallet on mount.
 * MiniPay sets `window.ethereum.isMiniPay = true` when active.
 */
export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const { isConnected } = useAccount();
  const { connect } = useConnect();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // MiniPay injects window.ethereum with isMiniPay = true
    const miniPay = (window as any)?.ethereum?.isMiniPay === true;
    setIsMiniPay(miniPay);

    // Auto-connect if inside MiniPay and not already connected
    if (miniPay && !isConnected) {
      connect({ connector: injected() });
    }
  }, [isConnected, connect]);

  return { isMiniPay };
}
