"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, type State } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { getWagmiConfig } from "@/lib/wagmi";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

function WalletProviderInner({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  return (
    <WagmiProvider config={getWagmiConfig()} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

/**
 * Root wallet provider — composes Wagmi, React Query, and RainbowKit.
 * Must wrap any component that uses wallet hooks.
 *
 * `initialState` is hydrated from cookies on the server (see the root layout)
 * so a previously connected wallet stays connected on first render.
 */
export function WalletProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState?: State;
}) {
  return (
    <WalletProviderInner initialState={initialState}>
      {children}
    </WalletProviderInner>
  );
}
