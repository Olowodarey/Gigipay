"use client";

import { useMiniPay } from "@/hooks/useMiniPay";

/**
 * Mounts the MiniPay zero-click auto-connect. Rendered once inside the wallet
 * provider so that when the app runs in MiniPay, the injected wallet connects
 * automatically — MiniPay requires that there is NO "Connect Wallet" button.
 * Renders nothing.
 */
export function MiniPayAutoConnect() {
  useMiniPay();
  return null;
}
