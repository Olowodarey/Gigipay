import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from "wagmi";
import { Address, parseUnits, erc20Abi } from "viem";
import { getContractConfig } from "@/lib/contracts/gigipay";

/**
 * Hook for approving ERC20 tokens for batch transfer
 * Works on both Celo and Base networks
 */
export function useTokenApproval(tokenAddress: Address) {
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  /**
   * Approve tokens for batch transfer
   * @param amount - Amount to approve (in token units, e.g., "100.5")
   * @param decimals - Token decimals (default 18)
   */
  const approve = (amount: string, decimals: number = 18) => {
    if (!chain) {
      throw new Error("No chain connected");
    }

    const contractConfig = getContractConfig(chain.id);
    const parsedAmount = parseUnits(amount, decimals);

    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [contractConfig.address, parsedAmount],
    });
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to check current allowance
 * Works on both Celo and Base networks
 */
export function useTokenAllowance(
  tokenAddress: Address,
  ownerAddress?: Address,
) {
  const { chain } = useAccount();
  const contractConfig = chain?.id ? getContractConfig(chain.id) : null;

  const {
    data: allowance,
    isLoading,
    refetch,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args:
      ownerAddress && contractConfig
        ? [ownerAddress, contractConfig.address]
        : undefined,
    query: {
      enabled: !!ownerAddress && !!contractConfig,
    },
  });

  return { allowance: allowance ?? 0n, isLoading, refetch };
}

/**
 * Hook to get token balance
 */
export function useTokenBalance(tokenAddress: Address, ownerAddress?: Address) {
  const {
    data: balance,
    isLoading,
    refetch,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress,
    },
  });

  return { balance: balance ?? 0n, isLoading, refetch };
}
