import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseUnits, Address } from "viem";
import { getContractConfig } from "@/lib/contracts/gigipay";
import { useEffect, useState } from "react";
import { isContractPaused } from "@/lib/api";

export type BatchTransferRecipient = {
  address: Address;
  amount: string;
};

/**
 * Hook for batch transferring native tokens or ERC20 tokens
 */
export function useBatchTransfer() {
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const executeBatchTransfer = async (
    tokenAddress: Address,
    recipients: BatchTransferRecipient[],
    decimals: number = 18,
  ) => {
    if (!chain) throw new Error("No chain connected");

    const contractConfig = getContractConfig(chain.id);
    const addresses = recipients.map((r) => r.address);
    const amounts = recipients.map((r) => parseUnits(r.amount, decimals));
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
 * Hook to check if contract is paused — reads from backend API
 */
export function useContractPaused() {
  const { chain } = useAccount();
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chain?.id) return;
    setIsLoading(true);
    isContractPaused(chain.id)
      .then(setIsPaused)
      .catch(() => setIsPaused(false))
      .finally(() => setIsLoading(false));
  }, [chain?.id]);

  return { isPaused, isLoading };
}
