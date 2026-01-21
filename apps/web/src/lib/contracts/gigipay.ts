import { Address, Chain } from "viem";
import { celo, base } from "viem/chains";
import { GIGIPAY_ABI } from "./abi";

export { GIGIPAY_ABI };

/**
 * Contract addresses by chain
 */
export const CONTRACT_ADDRESSES = {
  [celo.id]: "0x7B7750Fb5f0ce9C908fCc0674F8B35782F6d40B3" as Address, // Celo Mainnet
  [base.id]: "0xEdc6abb2f1A25A191dAf8B648c1A3686EfFE6Dd6" as Address, // Base Mainnet
} as const;

/**
 * Get contract address for a specific chain
 */
export function getContractAddress(chainId: number): Address {
  const address =
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!address) {
    throw new Error(`Contract not deployed on chain ${chainId}`);
  }
  return address;
}

/**
 * Get contract configuration for a specific chain
 */
export function getContractConfig(chainId: number) {
  return {
    address: getContractAddress(chainId),
    abi: GIGIPAY_ABI,
  } as const;
}

/**
 * Check if contract is deployed on a chain
 */
export function isContractDeployed(chainId: number): boolean {
  return chainId in CONTRACT_ADDRESSES;
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(CONTRACT_ADDRESSES).map(Number);
}

/**
 * Token addresses by chain
 */
export const TOKEN_ADDRESSES = {
  // Celo tokens
  [celo.id]: {
    CELO: "0x0000000000000000000000000000000000000000" as Address, // Native CELO
    cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as Address,
    cEUR: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73" as Address,
    cREAL: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787" as Address,
    USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as Address,
    USDT: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as Address,
  },
  // Base tokens
  [base.id]: {
    ETH: "0x0000000000000000000000000000000000000000" as Address, // Native ETH
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address, // Base USDC
    USDbC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA" as Address, // Bridged USDC
  },
} as const;

/**
 * Get token addresses for a specific chain
 */
export function getTokenAddresses(chainId: number) {
  const tokens = TOKEN_ADDRESSES[chainId as keyof typeof TOKEN_ADDRESSES];
  if (!tokens) {
    throw new Error(`No token addresses configured for chain ${chainId}`);
  }
  return tokens;
}

/**
 * Get native token symbol for a chain
 */
export function getNativeTokenSymbol(chainId: number): string {
  if (chainId === celo.id) return "CELO";
  if (chainId === base.id) return "ETH";
  return "ETH"; // Default
}

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;
export type CeloTokenSymbol = keyof (typeof TOKEN_ADDRESSES)[typeof celo.id];
export type BaseTokenSymbol = keyof (typeof TOKEN_ADDRESSES)[typeof base.id];
