"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { getMyProfile, UserProfile } from "@/lib/api";

const TOKEN_KEY = "gigipay_token";

/**
 * Returns the current user profile from the backend for a connected wallet.
 * Re-fetches when the wallet connection changes.
 */
export function useUser() {
  const { isConnected: walletConnected } = useAccount();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const fetchProfile = useCallback(async () => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    setHasToken(!!stored);
    if (!stored) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getMyProfile(stored);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [walletConnected, fetchProfile]);

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
    setHasToken(false);
  }, []);

  return {
    profile,
    loading,
    isLoggedIn: hasToken && walletConnected,
    isWalletUser: walletConnected,
    logout,
    refetch: fetchProfile,
  };
}
