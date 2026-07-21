import { createConfig, createStorage, cookieStorage, http } from "wagmi";
import { celo, base } from "wagmi/chains";

/**
 * Minimal wagmi config used ONLY on the server to turn the request cookie into a
 * wagmi `initialState` (via `cookieToInitialState`).
 *
 * It deliberately omits the RainbowKit connectors: `connectorsForWallets` is a
 * client-only function and calling it during a Server Component render throws
 * "Attempted to call connectorsForWallets() from the server". `cookieToInitialState`
 * only needs the storage key to locate/parse the persisted cookie, which matches
 * the full client config in `@/lib/wagmi` (both default to the "wagmi" key), so
 * the parsed state is identical. The real connectors live on the client config
 * that `WagmiProvider` actually runs with.
 */
export const ssrWagmiConfig = createConfig({
  chains: [celo, base],
  transports: {
    [celo.id]: http(),
    [base.id]: http(),
  },
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
});
