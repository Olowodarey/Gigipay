"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { celo, base } from "viem/chains";

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
        loginMethods: ["email", "sms", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#10b981",
          logo: "/newlogo-cropped.png",
        },
        defaultChain: celo,
        supportedChains: [celo, base],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
