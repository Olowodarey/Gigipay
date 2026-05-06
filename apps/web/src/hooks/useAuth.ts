"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface UserProfile {
  address: string;
  email?: string;
  phone?: string;
  displayName?: string;
  isMiniPay: boolean;
  createdAt: string;
  updatedAt: string;
}

const TOKEN_KEY = "gigipay_token";

/** Retrieve the stored JWT from localStorage (SSR-safe). */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Persist a JWT to localStorage. */
function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Remove the stored JWT from localStorage. */
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Manages wallet-based authentication (SIWE flow).
 *
 * Flow:
 * 1. `signIn()` — fetches a nonce, prompts wallet signature, verifies with backend, stores JWT
 * 2. On wallet connect — auto-restores an existing session via `loadProfile()`
 * 3. MiniPay exception — auto-triggers `signIn()` since MiniPay has no manual sign-in UI
 * 4. `signOut()` — clears the JWT and resets state
 *
 * Returns `isAuthenticated: true` only when both a valid JWT and user profile are present.
 */
export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect MiniPay — all logic stays here, no backend needed for detection
  const isMiniPay =
    typeof window !== "undefined" &&
    (window as any)?.ethereum?.isMiniPay === true;

  // Sign in: get nonce from backend → sign → verify with backend → get JWT
  const signIn = useCallback(async () => {
    if (!address) return;
    setIsAuthenticating(true);
    setError(null);

    try {
      // 1. Get nonce from backend
      const nonceRes = await fetch(`${API_BASE}/auth/nonce?address=${address}`);
      const { message } = await nonceRes.json();

      // 2. Sign the message with wallet (only thing that happens on frontend)
      const signature = await signMessageAsync({ message });

      // 3. Send signature to backend for verification
      const verifyRes = await fetch(`${API_BASE}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature, message, isMiniPay }),
      });

      if (!verifyRes.ok) throw new Error("Verification failed");

      const { token: jwt, user: profile } = await verifyRes.json();

      storeToken(jwt);
      setToken(jwt);
      setUser(profile);
    } catch (err: any) {
      setError(err.message || "Sign in failed");
      clearToken();
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, isMiniPay, signMessageAsync]);

  // Load user profile from backend using stored token
  const loadProfile = useCallback(async () => {
    const stored = getStoredToken();
    if (!stored || !address) return;

    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${stored}` },
      });
      if (!res.ok) {
        clearToken();
        setToken(null);
        return;
      }
      const profile = await res.json();
      setUser(profile);
      setToken(stored);
    } catch {
      clearToken();
      setToken(null);
    }
  }, [address]);

  // Sign out
  const signOut = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  // Auto-restore session on wallet connect — never auto-prompt for signature
  useEffect(() => {
    if (!isConnected || !address) {
      signOut();
      return;
    }
    // Only restore an existing valid session — never auto-trigger a signature popup
    // MiniPay is the exception: it has no manual sign-in UI so we auto sign-in
    loadProfile().then(() => {
      if (!getStoredToken() && isMiniPay) {
        signIn();
      }
    });
  }, [isConnected, address]);

  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isAuthenticating,
    isMiniPay,
    error,
    signIn,
    signOut,
  };
}
