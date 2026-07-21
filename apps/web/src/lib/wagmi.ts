import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  createConfig,
  createStorage,
  cookieStorage,
  http,
} from "wagmi";
import { celo, base } from "wagmi/chains";
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";

/**
 * Lazily initialised wagmi config — created once and reused.
 * Supports Celo and Base with MiniPay (injected), MetaMask, Rainbow, and WalletConnect.
 *
 * Lives in a plain (non-"use client") module so it can be imported from BOTH the
 * server (root layout, to compute `cookieToInitialState`) and the client
 * (WalletProvider). Importing it from a "use client" file into a Server Component
 * throws "Attempted to call getWagmiConfig() from the server".
 */
let config: ReturnType<typeof createConfig> | null = null;

export function getWagmiConfig() {
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
      // Persist the active connection in cookies so the server can hydrate the
      // connected state on first render — keeps the wallet connected across page
      // navigations and reloads (no re-connect prompt on every page).
      storage: createStorage({ storage: cookieStorage }),
      ssr: true,
    });
  }
  return config;
}
