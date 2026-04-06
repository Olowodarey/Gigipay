"use client";

import { useEffect, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { privyLogin } from "@/lib/api";

const TOKEN_KEY = "gigipay_token";

export function usePrivyAuth() {
  const {
    ready,
    authenticated,
    user: privyUser,
    login,
    logout,
    getAccessToken,
  } = usePrivy();
  const { wallets } = useWallets();

  // The embedded wallet Privy creates for email/phone users
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");

  const syncWithBackend = useCallback(async () => {
    if (!privyUser) return;

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return;

      const { token } = await privyLogin({ accessToken });
      localStorage.setItem(TOKEN_KEY, token);
    } catch (err) {
      console.error("Failed to sync Privy user with backend:", err);
    }
  }, [privyUser, getAccessToken]);

  useEffect(() => {
    if (ready && authenticated) {
      syncWithBackend();
    }
    if (ready && !authenticated) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [ready, authenticated, syncWithBackend]);

  return {
    ready,
    authenticated,
    privyUser,
    embeddedWallet,
    login,
    logout,
  };
}
