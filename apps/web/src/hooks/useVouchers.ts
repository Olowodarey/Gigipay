import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseUnits, Address } from "viem";
import { getContractConfig } from "@/lib/contracts/gigipay";
import { useEffect, useState, useCallback } from "react";
import {
  getVoucher,
  getVouchersByName,
  getSenderVouchers,
  isVoucherClaimable,
  isVoucherRefundable,
  type VoucherDetail,
} from "@/lib/api";

// ─── Write Hooks (still need wallet signing) ─────────────────────────────────

export function useCreateVoucher() {
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const createVoucher = async (
    tokenAddress: Address,
    voucherName: string,
    claimCode: string,
    amount: string,
    expirationTime: number,
    decimals: number = 18,
  ) => {
    const parsedAmount = parseUnits(amount, decimals);
    const isNativeToken =
      tokenAddress === "0x0000000000000000000000000000000000000000";

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

  return { createVoucher, hash, isPending, isConfirming, isConfirmed, error };
}

export function useCreateVoucherBatch() {
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

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
    const claimCodes = vouchers.map((v) => v.claimCode);
    const amounts = vouchers.map((v) => parseUnits(v.amount, decimals));
    const expirationTimes = vouchers.map((v) => BigInt(v.expirationTime));
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);
    const isNativeToken =
      tokenAddress === "0x0000000000000000000000000000000000000000";

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

export function useClaimVoucher() {
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const claimVoucher = async (voucherName: string, claimCode: string) => {
    writeContract({
      address: getContractConfig(chain?.id || 0).address,
      abi: getContractConfig(chain?.id || 0).abi,
      functionName: "claimVoucher",
      args: [voucherName, claimCode],
    });
  };

  return { claimVoucher, hash, isPending, isConfirming, isConfirmed, error };
}

export function useRefundVoucher() {
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

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

// ─── Read Hooks — now call backend API instead of direct RPC ─────────────────

export function useVoucherDetails(voucherId: number) {
  const { chain } = useAccount();
  const [voucher, setVoucher] = useState<VoucherDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(() => {
    if (!chain?.id || !voucherId) return;
    setIsLoading(true);
    getVoucher(chain.id, String(voucherId))
      .then(setVoucher)
      .catch(() => setVoucher(null))
      .finally(() => setIsLoading(false));
  }, [chain?.id, voucherId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Normalise: pages compare voucher.expiresAt as bigint
  const normalised = voucher
    ? {
        ...voucher,
        amount: BigInt(voucher.amount),
        expiresAt: BigInt(voucher.expiresAt),
      }
    : null;

  return { voucher: normalised, isLoading, refetch };
}

export function useVouchersByName(voucherName?: string) {
  const { chain } = useAccount();
  const [voucherIds, setVoucherIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chain?.id || !voucherName) return;
    setIsLoading(true);
    getVouchersByName(chain.id, voucherName)
      .then(setVoucherIds)
      .catch(() => setVoucherIds([]))
      .finally(() => setIsLoading(false));
  }, [chain?.id, voucherName]);

  return { voucherIds, isLoading };
}

export function useSenderVouchers(senderAddress?: Address) {
  const { chain } = useAccount();
  const [voucherIds, setVoucherIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(() => {
    if (!chain?.id || !senderAddress) return;
    setIsLoading(true);
    getSenderVouchers(chain.id, senderAddress)
      .then(setVoucherIds)
      .catch(() => setVoucherIds([]))
      .finally(() => setIsLoading(false));
  }, [chain?.id, senderAddress]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { voucherIds, isLoading, refetch };
}

export function useIsVoucherClaimable(voucherId: number) {
  const { chain } = useAccount();
  const [isClaimable, setIsClaimable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chain?.id || !voucherId) return;
    setIsLoading(true);
    isVoucherClaimable(chain.id, String(voucherId))
      .then(setIsClaimable)
      .catch(() => setIsClaimable(false))
      .finally(() => setIsLoading(false));
  }, [chain?.id, voucherId]);

  return { isClaimable, isLoading };
}

export function useIsVoucherRefundable(voucherId: number) {
  const { chain } = useAccount();
  const [isRefundable, setIsRefundable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chain?.id || !voucherId) return;
    setIsLoading(true);
    isVoucherRefundable(chain.id, String(voucherId))
      .then(setIsRefundable)
      .catch(() => setIsRefundable(false))
      .finally(() => setIsLoading(false));
  }, [chain?.id, voucherId]);

  return { isRefundable, isLoading };
}
