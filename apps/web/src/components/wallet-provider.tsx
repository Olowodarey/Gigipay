"use client";

import { useState, useEffect } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig } from "wagmi";
import { celo, celoAlfajores, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { http } from "wagmi";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  coinbaseWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";

// Mainnet chains only - no testnets

// Create config with proper SSR handling
let config: any = null;

function getWagmiConfig() {
  if (!config) {
    const projectId =
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

    const connectors = connectorsForWallets(
      [
        {
          groupName: "Popular",
          wallets: [
            injectedWallet,
            metaMaskWallet,
            rainbowWallet,
            coinbaseWallet,
            walletConnectWallet,
          ],
        },
      ],
      {
        appName: "Gigipay",
        projectId,
      },
    );

    config = createConfig({
      connectors,
      chains: [celo, celoAlfajores, base], // Mainnet chains only
      transports: {
        [celo.id]: http(),
        [celoAlfajores.id]: http(),
        [base.id]: http(),
      },
      ssr: true,
    });
  }
  return config;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function WalletProviderInner({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={getWagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render wallet provider during SSR
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return <WalletProviderInner>{children}</WalletProviderInner>;
}
