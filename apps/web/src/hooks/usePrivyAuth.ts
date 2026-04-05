"use client";

import { useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { privyLogin } from "@/lib/api";

const TOKEN_KEY = "gigipay_token";

/**
 * Syncs Privy login (email/phone/social) with our backend.
 * Sends the Privy access token to POST /auth/privy for server-side verification.
 */
export function usePrivyAuth() {
  const {
    ready,
    authenticated,
    user: privyUser,
    login,
    logout,
    getAccessToken,
  } = usePrivy();

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
    login,
    logout,
  };
}
