"use client";

import { useEffect, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { privyLogin } from "@/lib/api";

const TOKEN_KEY = "gigipay_token";

/**
 * Syncs Privy login (email/phone) with our backend.
 * Calls POST /api/auth/privy to register/login the user.
 */
export function usePrivyAuth() {
  const { ready, authenticated, user: privyUser, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const syncWithBackend = useCallback(async () => {
    if (!privyUser) return;

    // Get embedded wallet (created by Privy for email/phone users)
    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
    if (!embeddedWallet) return;

    const email = privyUser.email?.address;
    const phone = privyUser.phone?.number;

    try {
      const { token } = await privyLogin({
        privyUserId: privyUser.id,
        walletAddress: embeddedWallet.address,
        email,
        phone,
      });
      localStorage.setItem(TOKEN_KEY, token);
    } catch (err) {
      console.error("Failed to sync Privy user with backend:", err);
    }
  }, [privyUser, wallets]);

  useEffect(() => {
    if (ready && authenticated) {
      syncWithBackend();
    }
  }, [ready, authenticated, syncWithBackend]);

  return {
    ready,
    authenticated,
    privyUser,
    login, // opens Privy modal — email, phone, or wallet
    logout,
  };
}
