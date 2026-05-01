"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig } from "wagmi";
import { celo, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { http } from "wagmi";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";

/**
 * Lazily initialised wagmi config — created once and reused.
 * Supports Celo and Base with MiniPay (injected), MetaMask, Rainbow, and WalletConnect.
 */
let config: any = null;

function getWagmiConfig() {
  if (!config) {
    const projectId =
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

    const connectors = connectorsForWallets(
      [
        {
          groupName: "MiniPay",
          wallets: [injectedWallet], // MiniPay injects itself here automatically
        },
        {
          groupName: "Other Wallets",
          wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet],
        },
      ],
      { appName: "Gigipay", projectId },
    );

    config = createConfig({
      connectors,
      chains: [celo, base],
      transports: {
        [celo.id]: http(),
        [base.id]: http(),
      },
      ssr: true,
    });
  }
  return config;
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
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

/**
 * Root wallet provider — composes Wagmi, React Query, and RainbowKit.
 * Must wrap any component that uses wallet hooks.
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return <WalletProviderInner>{children}</WalletProviderInner>;
}
