import type { Address } from "viem";

/**
 * Single source of truth for contract addresses.
 * Values come from env vars — update .env.local to change them.
 * Fallback addresses are the latest mainnet deployments.
 */
export const CONTRACT_ADDRESSES: Record<number, Address> = {
  42220: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CELO ||
    "0x79aB973f8985755dC7E185fcd0F60888e46019a3") as Address, // Celo Mainnet - Gigipay v2.0 (redeployed 2026-07-21, Safe admin)
  8453: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE ||
    "0xEdc6abb2f1A25A191dAf8B648c1A3686EfFE6Dd6") as Address, // Base Mainnet
};

// Celo Sepolia (testnet) — set NEXT_PUBLIC_CONTRACT_ADDRESS_CELO_SEPOLIA once a
// testnet contract is deployed. Registered only when present so the AI agent can
// optionally run against testnet without touching mainnet money.
if (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CELO_SEPOLIA) {
  CONTRACT_ADDRESSES[11142220] = process.env
    .NEXT_PUBLIC_CONTRACT_ADDRESS_CELO_SEPOLIA as Address;
}

/**
 * Returns the contract address for the given chain ID.
 * Throws a descriptive error if the chain is not supported.
 * @throws {Error} if chainId is undefined or not in CONTRACT_ADDRESSES
 */
export function getContractAddress(chainId?: number): Address {
  const address = chainId ? CONTRACT_ADDRESSES[chainId] : undefined;
  if (!address) throw new Error(`Unsupported chain: ${chainId}`);
  return address;
}

/**
 * Returns true if the given chain ID has a deployed contract.
 */
export function isSupportedChain(chainId?: number): boolean {
  return !!chainId && !!CONTRACT_ADDRESSES[chainId];
}
