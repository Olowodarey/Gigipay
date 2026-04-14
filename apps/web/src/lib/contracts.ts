import type { Address } from "viem";

/**
 * Single source of truth for contract addresses.
 * Values come from env vars — update .env.local to change them.
 */
export const CONTRACT_ADDRESSES: Record<number, Address> = {
  42220: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_CELO ||
    "0x70b92a67F391F674aFFfCE3Dd7EB3d99e1f1E9a8") as Address, // Celo
  8453: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE ||
    "0xEdc6abb2f1A25A191dAf8B648c1A3686EfFE6Dd6") as Address, // Base
};

export function getContractAddress(chainId?: number): Address {
  const address = chainId ? CONTRACT_ADDRESSES[chainId] : undefined;
  if (!address) throw new Error(`Unsupported chain: ${chainId}`);
  return address;
}
