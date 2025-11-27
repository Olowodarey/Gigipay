import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, Address } from 'viem';
import { BATCH_TRANSFER_CONTRACT } from '@/lib/contracts/batchTransfer';

/**
 * Hook for creating payment vouchers
 */
export function useCreateVoucher() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Create a single payment voucher
   * @param claimCode - Secret code to claim the voucher
   * @param amount - Amount in CELO (e.g., "10.5")
   * @param expirationTime - Unix timestamp when voucher expires
   */
  const createVoucher = async (claimCode: string, amount: string, expirationTime: number) => {
    const parsedAmount = parseUnits(amount, 18); // CELO has 18 decimals

    writeContract({
      address: BATCH_TRANSFER_CONTRACT.address,
      abi: BATCH_TRANSFER_CONTRACT.abi,
      functionName: 'createVoucher',
      args: [claimCode, BigInt(expirationTime)],
      value: parsedAmount,
    });
  };

  return {
    createVoucher,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook for creating multiple vouchers in batch
 */
export function useCreateVoucherBatch() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Create multiple vouchers in one transaction
   * @param vouchers - Array of { claimCode, amount, expirationTime }
   */
  const createVoucherBatch = async (
    vouchers: Array<{ claimCode: string; amount: string; expirationTime: number }>
  ) => {
    const claimCodes = vouchers.map((v) => v.claimCode);
    const amounts = vouchers.map((v) => parseUnits(v.amount, 18));
    const expirationTimes = vouchers.map((v) => BigInt(v.expirationTime));

    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);

    writeContract({
      address: BATCH_TRANSFER_CONTRACT.address,
      abi: BATCH_TRANSFER_CONTRACT.abi,
      functionName: 'createVoucherBatch',
      args: [claimCodes, amounts, expirationTimes],
      value: totalAmount,
    });
  };

  return {
    createVoucherBatch,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook for claiming a voucher
 */
export function useClaimVoucher() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Claim a voucher using its ID and claim code
   * @param voucherId - The voucher ID
   * @param claimCode - The secret claim code
   */
  const claimVoucher = async (voucherId: number, claimCode: string) => {
    writeContract({
      address: BATCH_TRANSFER_CONTRACT.address,
      abi: BATCH_TRANSFER_CONTRACT.abi,
      functionName: 'claimVoucher',
      args: [BigInt(voucherId), claimCode],
    });
  };

  return {
    claimVoucher,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook for refunding an expired voucher
 */
export function useRefundVoucher() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Refund an expired voucher
   * @param voucherId - The voucher ID to refund
   */
  const refundVoucher = async (voucherId: number) => {
    writeContract({
      address: BATCH_TRANSFER_CONTRACT.address,
      abi: BATCH_TRANSFER_CONTRACT.abi,
      functionName: 'refundVoucher',
      args: [BigInt(voucherId)],
    });
  };

  return {
    refundVoucher,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

/**
 * Hook to get voucher details
 */
export function useVoucherDetails(voucherId: number) {
  const { data, isLoading, refetch } = useReadContract({
    address: BATCH_TRANSFER_CONTRACT.address,
    abi: BATCH_TRANSFER_CONTRACT.abi,
    functionName: 'vouchers',
    args: [BigInt(voucherId)],
  });

  return {
    voucher: data
      ? {
          sender: data[0] as Address,
          amount: data[1] as bigint,
          claimCodeHash: data[2] as string,
          expiresAt: data[3] as bigint,
          claimed: data[4] as boolean,
          refunded: data[5] as boolean,
        }
      : null,
    isLoading,
    refetch,
  };
}

/**
 * Hook to get all vouchers created by a sender
 */
export function useSenderVouchers(senderAddress?: Address) {
  const { data, isLoading, refetch } = useReadContract({
    address: BATCH_TRANSFER_CONTRACT.address,
    abi: BATCH_TRANSFER_CONTRACT.abi,
    functionName: 'getSenderVouchers',
    args: senderAddress ? [senderAddress] : undefined,
    query: {
      enabled: !!senderAddress,
    },
  });

  return {
    voucherIds: (data as bigint[]) ?? [],
    isLoading,
    refetch,
  };
}

/**
 * Hook to check if a voucher is claimable
 */
export function useIsVoucherClaimable(voucherId: number) {
  const { data, isLoading } = useReadContract({
    address: BATCH_TRANSFER_CONTRACT.address,
    abi: BATCH_TRANSFER_CONTRACT.abi,
    functionName: 'isVoucherClaimable',
    args: [BigInt(voucherId)],
  });

  return {
    isClaimable: data ?? false,
    isLoading,
  };
}

/**
 * Hook to check if a voucher is refundable
 */
export function useIsVoucherRefundable(voucherId: number) {
  const { data, isLoading } = useReadContract({
    address: BATCH_TRANSFER_CONTRACT.address,
    abi: BATCH_TRANSFER_CONTRACT.abi,
    functionName: 'isVoucherRefundable',
    args: [BigInt(voucherId)],
  });

  return {
    isRefundable: data ?? false,
    isLoading,
  };
}
