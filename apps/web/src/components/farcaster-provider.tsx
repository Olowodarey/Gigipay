"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";

interface AuthResponse {
  user?: {
    fid?: number;
    username?: string;
  };
  authenticated?: boolean;
}

/**
 * Initialises the Farcaster MiniApp SDK on mount.
 * Calls `sdk.actions.ready()` to dismiss the loading splash screen,
 * then fetches the current Farcaster auth session from `/api/auth`.
 * Renders children regardless of auth state — auth data is for context only.
 */
export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [authData, setAuthData] = useState<AuthResponse | null>(null);

  useEffect(() => {
    // Trigger app display - hide loading splash screen
    sdk.actions.ready();

    // Authenticate users with Farcaster
    const authenticate = async () => {
      try {
        const response = await fetch("/api/auth", { method: "GET" });
        const data = await response.json();
        setAuthData(data);
      } catch (error) {
        console.error("Authentication error:", error);
      }
    };

    authenticate();
  }, []);

  return <>{children}</>;
}
