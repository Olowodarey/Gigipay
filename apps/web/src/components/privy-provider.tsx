"use client";

import { celo, base } from "viem/chains";

// Lazy import so the app doesn't crash if @privy-io/react-auth isn't installed yet
let PrivyProvider: any = null;
try {
  PrivyProvider = require("@privy-io/react-auth").PrivyProvider;
} catch {
  // package not installed yet
}

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  // If Privy isn't installed or no App ID, just render children
  if (!PrivyProvider || !process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
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
