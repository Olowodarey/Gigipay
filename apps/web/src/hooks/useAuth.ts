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
const TOKEN_ADDRESS_KEY = "gigipay_token_address";

/** Retrieve the stored JWT from localStorage (SSR-safe). */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** The wallet address the stored JWT was issued for (lowercased), if any. */
function getStoredAddress(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_ADDRESS_KEY);
}

/** Persist a JWT (bound to the address it was issued for) to localStorage. */
function storeToken(token: string, address: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_ADDRESS_KEY, address.toLowerCase());
}

/** Remove the stored JWT from localStorage. */
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_ADDRESS_KEY);
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

  // Sign in. Normal browsers use SIWE (get nonce → sign → verify). Inside MiniPay
  // there is no message signing (personal_sign is unsupported), so we use the
  // no-signature MiniPay session endpoint bound to the injected wallet address.
  const signIn = useCallback(async () => {
    if (!address) return;
    setIsAuthenticating(true);
    setError(null);

    try {
      let jwt: string;
      let profile: UserProfile;

      if (isMiniPay) {
        // MiniPay: no signature — issue a session for the connected address.
        const res = await fetch(`${API_BASE}/auth/minipay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });
        if (!res.ok) throw new Error("Sign in failed");
        ({ token: jwt, user: profile } = await res.json());
      } else {
        // 1. Get nonce from backend
        const nonceRes = await fetch(
          `${API_BASE}/auth/nonce?address=${address}`,
        );
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
        ({ token: jwt, user: profile } = await verifyRes.json());
      }

      storeToken(jwt, address);
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

  // Auto-restore session on wallet connect — never auto-prompt for signature.
  useEffect(() => {
    // Wallet fully disconnected: drop the in-memory profile so gated UI hides,
    // but KEEP the stored JWT so a reconnect (or page reload / navigation)
    // restores the same session without a new signature. Only an explicit
    // signOut() or an account switch clears the token.
    if (!isConnected || !address) {
      setUser(null);
      return;
    }

    // Connected as a different wallet than the session was issued for → that
    // session isn't valid for this account, so clear it (the new account will
    // sign in on its own).
    const boundAddress = getStoredAddress();
    if (boundAddress && boundAddress !== address.toLowerCase()) {
      signOut();
      return;
    }

    // Same account (or restoring after reload): restore profile from stored JWT.
    // Never auto-trigger a signature popup — MiniPay is the exception since it
    // has no manual sign-in UI.
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
