"use client";

import { useEffect, useState } from "react";
import { detectMiniPay } from "@/lib/minipay";

/**
 * Reactive MiniPay detection. Starts `false` (SSR-safe) and flips to `true` on
 * mount if running inside the MiniPay wallet webview. Use this to hide CELO,
 * skip the connect button, and switch auth to the no-signature path.
 */
export function useIsMiniPay(): boolean {
  const [isMiniPay, setIsMiniPay] = useState(false);
  useEffect(() => {
    setIsMiniPay(detectMiniPay());
  }, []);
  return isMiniPay;
}
