"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { getMyProfile, UserProfile } from "@/lib/api";

const TOKEN_KEY = "gigipay_token";

/**
 * Unified hook that returns the current user profile from the backend,
 * regardless of whether they logged in via wallet or Privy (email/phone).
 * Automatically re-fetches when auth state changes.
 */
export function useUser() {
  const {
    ready,
    authenticated: privyAuthenticated,
    logout: privyLogout,
  } = usePrivy();
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
    if (ready) {
      fetchProfile();
    }
  }, [ready, privyAuthenticated, walletConnected, fetchProfile]);

  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
    setHasToken(false);
    if (privyAuthenticated) {
      await privyLogout();
    }
  }, [privyAuthenticated, privyLogout]);

  return {
    profile,
    loading,
    isLoggedIn: hasToken && (privyAuthenticated || walletConnected),
    isPrivyUser: privyAuthenticated,
    isWalletUser: walletConnected,
    logout,
    refetch: fetchProfile,
  };
}
