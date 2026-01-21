import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { getContractConfig } from "@/lib/contracts/gigipay";

/**
 * Hook to interact with Gigipay contract on the current chain
 * Automatically uses the correct contract address based on connected chain
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

/**
 * Hook to read from Gigipay contract
 */
export function useGigipayRead<T = unknown>(
  functionName: string,
  args?: unknown[],
) {
  const { contractConfig } = useGigipayContract();

  return useReadContract({
    ...contractConfig,
    functionName,
    args,
  } as any);
}

/**
 * Hook to write to Gigipay contract
 */
export function useGigipayWrite() {
  const { contractConfig } = useGigipayContract();
  const { writeContract, ...rest } = useWriteContract();

  const write = (functionName: string, args?: unknown[], value?: bigint) => {
    if (!contractConfig) {
      throw new Error("Contract not available on current chain");
    }

    return writeContract({
      ...contractConfig,
      functionName,
      args,
      value,
    } as any);
  };

  return {
    write,
    ...rest,
  };
}
