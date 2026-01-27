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

/**
 * Hook for creating payment vouchers
 */
export function useCreateVoucher() {
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  /**
   * Create a single payment voucher
   * @param tokenAddress - Token contract address (use address(0) for native token)
   * @param voucherName - Name identifier for the voucher
   * @param claimCode - Secret code to claim the voucher
   * @param amount - Amount in tokens (e.g., "10.5")
   * @param expirationTime - Unix timestamp when voucher expires
   * @param decimals - Token decimals (default: 18)
   */
  const createVoucher = async (
    tokenAddress: Address,
    voucherName: string,
    claimCode: string,
    amount: string,
    expirationTime: number,
    decimals: number = 18,
  ) => {
    // Validate inputs
    if (!voucherName || voucherName.trim().length === 0) {
      throw new Error("Voucher name cannot be empty");
    }
    if (!claimCode || claimCode.trim().length === 0) {
      throw new Error("Claim code cannot be empty");
    }
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (expirationTime <= Math.floor(Date.now() / 1000)) {
      throw new Error("Expiration time must be in the future");
    }

    const parsedAmount = parseUnits(amount, decimals);
    const isNativeToken =
      tokenAddress === "0x0000000000000000000000000000000000000000";

    // Debug logging
    console.log("Creating single voucher:", {
      tokenAddress,
      voucherName,
      claimCode,
      amount,
      parsedAmount: parsedAmount.toString(),
      expirationTime,
      currentTime: Math.floor(Date.now() / 1000),
    });

    // Use createVoucherBatch with single-element arrays
    writeContract({
      address: getContractConfig(chain?.id || 0).address,
      abi: getContractConfig(chain?.id || 0).abi,
      functionName: "createVoucherBatch",
      args: [
        tokenAddress,
        voucherName,
        [claimCode],
        [parsedAmount],
        [BigInt(expirationTime)],
      ],
      value: isNativeToken ? parsedAmount : 0n,
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
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  /**
   * Create multiple vouchers in one transaction
   * @param tokenAddress - Token contract address (use address(0) for native token)
   * @param voucherName - Name identifier for all vouchers in this batch
   * @param vouchers - Array of { claimCode, amount, expirationTime }
   * @param decimals - Token decimals (default: 18)
   */
  const createVoucherBatch = async (
    tokenAddress: Address,
    voucherName: string,
    vouchers: Array<{
      claimCode: string;
      amount: string;
      expirationTime: number;
    }>,
    decimals: number = 18,
  ) => {
    // Validate inputs
    if (!voucherName || voucherName.trim().length === 0) {
      throw new Error("Voucher name cannot be empty");
    }
    if (!vouchers || vouchers.length === 0) {
      throw new Error("Must have at least one voucher");
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
        throw new Error(
          `Voucher ${index + 1}: Expiration time must be in the future`,
        );
      }
    });

    const claimCodes = vouchers.map((v) => v.claimCode);
    const amounts = vouchers.map((v) => parseUnits(v.amount, decimals));
    const expirationTimes = vouchers.map((v) => BigInt(v.expirationTime));

    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);
    const isNativeToken =
      tokenAddress === "0x0000000000000000000000000000000000000000";

    // Debug logging
    console.log("Creating voucher batch:", {
      tokenAddress,
      voucherName,
      voucherCount: vouchers.length,
      claimCodes,
      amounts: amounts.map((a) => a.toString()),
      expirationTimes: expirationTimes.map((t) => t.toString()),
      totalAmount: totalAmount.toString(),
      currentTime,
    });

    writeContract({
      address: getContractConfig(chain?.id || 0).address,
      abi: getContractConfig(chain?.id || 0).abi,
      functionName: "createVoucherBatch",
      args: [tokenAddress, voucherName, claimCodes, amounts, expirationTimes],
      value: isNativeToken ? totalAmount : 0n,
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
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  /**
   * Claim a voucher using voucher name and claim code
   * @param voucherName - The voucher name identifier
   * @param claimCode - The secret claim code
   */
  const claimVoucher = async (voucherName: string, claimCode: string) => {
    writeContract({
      address: getContractConfig(chain?.id || 0).address,
      abi: getContractConfig(chain?.id || 0).abi,
      functionName: "claimVoucher",
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
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  /**
   * Refund all expired vouchers by name
   * @param voucherName - The voucher name to refund
   */
  const refundVouchersByName = async (voucherName: string) => {
    writeContract({
      address: getContractConfig(chain?.id || 0).address,
      abi: getContractConfig(chain?.id || 0).abi,
      functionName: "refundVouchersByName",
      args: [voucherName],
    });
  };

  return {
    refundVouchersByName,
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
  const { chain } = useAccount();
  const { data, isLoading, refetch } = useReadContract({
    address: getContractConfig(chain?.id || 0).address,
    abi: getContractConfig(chain?.id || 0).abi,
    functionName: "vouchers",
    args: [BigInt(voucherId)],
  });

  return {
    voucher: data
      ? {
          sender: data[0] as Address,
          token: data[1] as Address,
          amount: data[2] as unknown as bigint,
          claimCodeHash: data[3] as unknown as string,
          expiresAt: data[4] as unknown as bigint,
          claimed: data[5] as unknown as boolean,
          refunded: data[6] as boolean,
          voucherName: data[7] as unknown as string,
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
  const { chain } = useAccount();
  const { data, isLoading, refetch } = useReadContract({
    address: getContractConfig(chain?.id || 0).address,
    abi: getContractConfig(chain?.id || 0).abi,
    functionName: "getSenderVouchers",
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
  const { chain } = useAccount();
  const { data, isLoading, refetch } = useReadContract({
    address: getContractConfig(chain?.id || 0).address,
    abi: getContractConfig(chain?.id || 0).abi,
    functionName: "getVouchersByName",
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
  const { chain } = useAccount();
  const { data, isLoading } = useReadContract({
    address: getContractConfig(chain?.id || 0).address,
    abi: getContractConfig(chain?.id || 0).abi,
    functionName: "isVoucherClaimable",
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
  const { chain } = useAccount();
  const { data, isLoading } = useReadContract({
    address: getContractConfig(chain?.id || 0).address,
    abi: getContractConfig(chain?.id || 0).abi,
    functionName: "isVoucherRefundable",
    args: [BigInt(voucherId)],
  });

  return {
    isRefundable: data ?? false,
    isLoading,
  };
}
