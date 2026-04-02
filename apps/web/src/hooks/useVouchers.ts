import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseUnits, Address } from "viem";
import { useEffect, useState, useCallback } from "react";

const CONTRACT_ADDRESSES: Record<number, Address> = {
  42220: "0x7B7750Fb5f0ce9C908fCc0674F8B35782F6d40B3", // Celo
  8453: "0xEdc6abb2f1A25A191dAf8B648c1A3686EfFE6Dd6", // Base
};

const GIGIPAY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "string", name: "voucherName", type: "string" },
      { internalType: "string[]", name: "claimCodes", type: "string[]" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
      { internalType: "uint256[]", name: "expirationTimes", type: "uint256[]" },
    ],
    name: "createVoucherBatch",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "voucherName", type: "string" },
      { internalType: "string", name: "claimCode", type: "string" },
    ],
    name: "claimVoucher",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "voucherName", type: "string" }],
    name: "refundVouchersByName",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

function getContractAddress(chainId?: number): Address {
  const address = chainId ? CONTRACT_ADDRESSES[chainId] : undefined;
  if (!address) throw new Error(`Unsupported chain: ${chainId}`);
  return address;
}
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
      address: getContractAddress(chain?.id),
      abi: GIGIPAY_ABI,
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
      address: getContractAddress(chain?.id),
      abi: GIGIPAY_ABI,
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
      address: getContractAddress(chain?.id),
      abi: GIGIPAY_ABI,
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
      address: getContractAddress(chain?.id),
      abi: GIGIPAY_ABI,
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
