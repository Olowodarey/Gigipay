import { useAccount, useWriteContract } from "wagmi";
import { getContractConfig } from "@/lib/contracts/gigipay";

/**
 * Lightweight hook — only exposes write capability.
 * All reads are handled by the backend API (see src/lib/api.ts).
 */
export function useGigipayContract() {
  const { chain } = useAccount();
  const contractConfig = chain?.id ? getContractConfig(chain.id) : null;

  return {
    contractConfig,
    chainId: chain?.id,
    isSupported: !!contractConfig,
  };
}

export function useGigipayWrite() {
  const { contractConfig } = useGigipayContract();
  const { writeContract, ...rest } = useWriteContract();

  const write = (functionName: string, args?: unknown[], value?: bigint) => {
    if (!contractConfig)
      throw new Error("Contract not available on current chain");
    return writeContract({
      ...contractConfig,
      functionName,
      args,
      value,
    } as any);
  };

  return { write, ...rest };
}
