import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from "wagmi";
import { parseUnits, Address } from "viem";
import {
  getContractConfig,
  getTokenAddresses,
  getNativeTokenSymbol,
} from "@/lib/contracts/gigipay";

export type BatchTransferRecipient = {
  address: Address;
  amount: string;
};

/**
 * Hook for batch transferring native tokens or ERC20 tokens
 * Automatically works on both Celo and Base networks
 */
export function useBatchTransfer() {
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  /**
   * Execute batch transfer
   * @param tokenAddress - Token contract address (use '0x0000000000000000000000000000000000000000' for native token)
   * @param recipients - Array of recipients with address and amount
   * @param decimals - Token decimals (18 for most tokens)
   */
  const executeBatchTransfer = async (
    tokenAddress: Address,
    recipients: BatchTransferRecipient[],
    decimals: number = 18,
  ) => {
    if (!chain) {
      throw new Error("No chain connected");
    }

    const contractConfig = getContractConfig(chain.id);
    const addresses = recipients.map((r) => r.address);
    const amounts = recipients.map((r) => parseUnits(r.amount, decimals));

    // Calculate total amount for native token transfers
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);

    const isNativeToken =
      tokenAddress === "0x0000000000000000000000000000000000000000";

    writeContract({
      address: contractConfig.address,
      abi: contractConfig.abi,
      functionName: "batchTransfer",
      args: [tokenAddress, addresses, amounts],
      value: isNativeToken ? totalAmount : 0n,
    });
  };

  return {
    executeBatchTransfer,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to check if contract is paused
 * Works on both Celo and Base networks
 */
export function useContractPaused() {
  const { chain } = useAccount();

  const contractConfig = chain?.id ? getContractConfig(chain.id) : null;

  const { data: isPaused, isLoading } = useReadContract({
    address: contractConfig?.address,
    abi: contractConfig?.abi,
    functionName: "paused",
    query: {
      enabled: !!contractConfig,
    },
  });

  return { isPaused: (isPaused as boolean) ?? false, isLoading };
}
