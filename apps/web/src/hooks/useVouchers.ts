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
   * @param voucherName - Name identifier for the voucher
   * @param claimCode - Secret code to claim the voucher
   * @param amount - Amount in CELO (e.g., "10.5")
   * @param expirationTime - Unix timestamp when voucher expires
   */
  const createVoucher = async (voucherName: string, claimCode: string, amount: string, expirationTime: number) => {
    // Validate inputs
    if (!voucherName || voucherName.trim().length === 0) {
      throw new Error('Voucher name cannot be empty');
    }
    if (!claimCode || claimCode.trim().length === 0) {
      throw new Error('Claim code cannot be empty');
    }
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (expirationTime <= Math.floor(Date.now() / 1000)) {
      throw new Error('Expiration time must be in the future');
    }

    const parsedAmount = parseUnits(amount, 18); // CELO has 18 decimals

    // Debug logging
    console.log('Creating single voucher:', {
      voucherName,
      claimCode,
      amount,
      parsedAmount: parsedAmount.toString(),
      expirationTime,
      currentTime: Math.floor(Date.now() / 1000),
    });

    writeContract({
      address: BATCH_TRANSFER_CONTRACT.address,
      abi: BATCH_TRANSFER_CONTRACT.abi,
      functionName: 'createVoucher',
      args: [voucherName, claimCode, BigInt(expirationTime)],
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
   * @param voucherName - Name identifier for all vouchers in this batch
   * @param vouchers - Array of { claimCode, amount, expirationTime }
   */
  const createVoucherBatch = async (
    voucherName: string,
    vouchers: Array<{ claimCode: string; amount: string; expirationTime: number }>
  ) => {
    // Validate inputs
    if (!voucherName || voucherName.trim().length === 0) {
      throw new Error('Voucher name cannot be empty');
    }
    if (!vouchers || vouchers.length === 0) {
      throw new Error('Must have at least one voucher');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    
    // Validate each voucher
    vouchers.forEach((v, index) => {
      if (!v.claimCode || v.claimCode.trim().length === 0) {
        throw new Error(`Voucher ${index + 1}: Claim code cannot be empty`);
      }
      if (!v.amount || parseFloat(v.amount) <= 0) {
        throw new Error(`Voucher ${index + 1}: Amount must be greater than 0`);
      }
      if (v.expirationTime <= currentTime) {
        throw new Error(`Voucher ${index + 1}: Expiration time must be in the future`);
      }
    });

    const claimCodes = vouchers.map((v) => v.claimCode);
    const amounts = vouchers.map((v) => parseUnits(v.amount, 18));
    const expirationTimes = vouchers.map((v) => BigInt(v.expirationTime));

    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);

    // Debug logging
    console.log('Creating voucher batch:', {
      voucherName,
      voucherCount: vouchers.length,
      claimCodes,
      amounts: amounts.map(a => a.toString()),
      expirationTimes: expirationTimes.map(t => t.toString()),
      totalAmount: totalAmount.toString(),
      currentTime,
    });

    writeContract({
      address: BATCH_TRANSFER_CONTRACT.address,
      abi: BATCH_TRANSFER_CONTRACT.abi,
      functionName: 'createVoucherBatch',
      args: [voucherName, claimCodes, amounts, expirationTimes],
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
   * Claim a voucher using voucher name and claim code
   * @param voucherName - The voucher name identifier
   * @param claimCode - The secret claim code
   */
  const claimVoucher = async (voucherName: string, claimCode: string) => {
    writeContract({
      address: BATCH_TRANSFER_CONTRACT.address,
      abi: BATCH_TRANSFER_CONTRACT.abi,
      functionName: 'claimVoucher',
      args: [voucherName, claimCode],
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
          voucherName: data[6] as string,
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
 * Hook to get all vouchers by name
 */
export function useVouchersByName(voucherName?: string) {
  const { data, isLoading, refetch } = useReadContract({
    address: BATCH_TRANSFER_CONTRACT.address,
    abi: BATCH_TRANSFER_CONTRACT.abi,
    functionName: 'getVouchersByName',
    args: voucherName ? [voucherName] : undefined,
    query: {
      enabled: !!voucherName,
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
