import { useAccount, useWriteContract } from "wagmi";
import type { Address } from "viem";

// Contract addresses — write hooks need these for signing
const CONTRACT_ADDRESSES: Record<number, Address> = {
  42220: "0x7B7750Fb5f0ce9C908fCc0674F8B35782F6d40B3", // Celo Mainnet
  8453: "0xEdc6abb2f1A25A191dAf8B648c1A3686EfFE6Dd6", // Base Mainnet
};

/**
 * Returns the current chain's contract address and whether it is supported.
 */
export function useGigipayContract() {
  const { chain } = useAccount();
  const address = chain?.id ? CONTRACT_ADDRESSES[chain.id] : undefined;

  return {
    contractAddress: address,
    chainId: chain?.id,
    isSupported: !!address,
  };
}

/**
 * Convenience hook that wraps writeContract with the current chain's
 * Gigipay contract address pre-filled.
 */
export function useGigipayWrite() {
  const { contractAddress } = useGigipayContract();
  const { writeContract, ...rest } = useWriteContract();

  const write = (
    abi: readonly object[],
    functionName: string,
    args?: unknown[],
    value?: bigint,
  ) => {
    if (!contractAddress)
      throw new Error("Contract not available on current chain");
    return writeContract({
      address: contractAddress,
      abi,
      functionName,
      args,
      value,
    } as any);
  };

  return { write, ...rest };
}
