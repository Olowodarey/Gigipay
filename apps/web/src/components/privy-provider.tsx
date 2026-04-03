"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { celo, base } from "viem/chains";

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
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
          createOnLogin: "users-without-wallets", // auto-create wallet for email/phone users
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
