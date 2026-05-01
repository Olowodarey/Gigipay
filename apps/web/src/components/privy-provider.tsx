"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { celo, base } from "viem/chains";

/**
 * Wraps the app with Privy authentication.
 * Supports Google, email, SMS, and wallet login methods.
 * Falls back to rendering children without Privy if the app ID is missing.
 */
export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not set");
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["google", "email", "sms", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#10b981",
          logo: "/newlogo-cropped.png",
        },
        defaultChain: celo,
        supportedChains: [celo, base],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
