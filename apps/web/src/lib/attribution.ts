import { toDataSuffix, codeFromHostname } from "@celo/attribution-tags";
import { concat, type Hex } from "viem";

/**
 * ERC-8021 attribution tag (Celo). Appends a small, execution-invisible suffix
 * to a transaction's calldata so Celo can attribute the transaction to Gigipay
 * — this feeds ecosystem impact tracking and future reward distribution.
 *
 * Uses the hostname-derived code (no registration). Guarded for SSR — the tag is
 * only derivable in the browser.
 */

// Celo Mainnet + Celo Sepolia. Attribution is Celo-only; never tag Base txs.
const CELO_CHAIN_IDS = new Set([42220, 11142220]);

let cached: Hex | null = null;

/** The attribution suffix for the current host, or undefined (SSR / non-Celo). */
export function getAttributionSuffix(chainId?: number): Hex | undefined {
  if (typeof window === "undefined") return undefined;
  if (chainId != null && !CELO_CHAIN_IDS.has(chainId)) return undefined;
  if (cached) return cached;
  try {
    cached = toDataSuffix(codeFromHostname(window.location.hostname)) as Hex;
    return cached;
  } catch {
    return undefined;
  }
}

/**
 * Append the attribution suffix to prepared calldata for a Celo transaction.
 * Returns the data unchanged for non-Celo chains or when unavailable. The EVM
 * discards trailing bytes, so this never affects contract execution.
 */
export function withAttribution(data: Hex, chainId: number): Hex {
  const suffix = getAttributionSuffix(chainId);
  return suffix ? (concat([data, suffix]) as Hex) : data;
}
