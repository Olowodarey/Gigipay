import type { Address } from "viem";

/**
 * Single source of truth for contract addresses.
 * Values come from env vars — update .env.local to change them.
 * Fallback addresses are the latest mainnet deployments.
 */
export const CONTRACT_ADDRESSES: Record<number, Address> = {
  42220: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CELO ||
    "0x4e83B060F788413e97ad0Dd5FC9FC8781CC95cDc") as Address, // Celo Mainnet - Gigipay v2.0
  8453: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE ||
    "0xEdc6abb2f1A25A191dAf8B648c1A3686EfFE6Dd6") as Address, // Base Mainnet
};

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
