import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseUnits, Address } from "viem";
import { useEffect, useState } from "react";
import { isContractPaused } from "@/lib/api";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";

const BATCH_TRANSFER_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address[]", name: "recipients", type: "address[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
    ],
    name: "batchTransfer",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

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

    const address = CONTRACT_ADDRESSES[chain.id];
    if (!address) throw new Error(`Unsupported chain: ${chain.id}`);

    const addresses = recipients.map((r) => r.address);
    const amounts = recipients.map((r) => parseUnits(r.amount, decimals));
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);
    const isNativeToken =
      tokenAddress === "0x0000000000000000000000000000000000000000";

    writeContract({
      address,
      abi: BATCH_TRANSFER_ABI,
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
