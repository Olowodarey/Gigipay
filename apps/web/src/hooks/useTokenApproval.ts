import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from "wagmi";
import { Address, parseUnits, erc20Abi } from "viem";

// Contract addresses per chain — kept here since approval needs the spender address
const CONTRACT_ADDRESSES: Record<number, Address> = {
  42220: "0x7B7750Fb5f0ce9C908fCc0674F8B35782F6d40B3", // Celo
  8453: "0xEdc6abb2f1A25A191dAf8B648c1A3686EfFE6Dd6", // Base
};

function getSpenderAddress(chainId?: number): Address | undefined {
  return chainId ? CONTRACT_ADDRESSES[chainId] : undefined;
}

/**
 * Hook for approving ERC20 tokens for the Gigipay contract
 */
export function useTokenApproval(tokenAddress: Address) {
  const { chain } = useAccount();
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const approve = (amount: string, decimals: number = 18) => {
    const spender = getSpenderAddress(chain?.id);
    if (!spender) throw new Error("No chain connected or unsupported chain");

    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, parseUnits(amount, decimals)],
    });
  };

  return { approve, hash, isPending, isConfirming, isConfirmed, error };
}

/**
 * Hook to check current ERC20 allowance for the Gigipay contract
 */
export function useTokenAllowance(
  tokenAddress: Address,
  ownerAddress?: Address,
) {
  const { chain } = useAccount();
  const spender = getSpenderAddress(chain?.id);

  const {
    data: allowance,
    isLoading,
    refetch,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: ownerAddress && spender ? [ownerAddress, spender] : undefined,
    query: { enabled: !!ownerAddress && !!spender },
  });

  return { allowance: allowance ?? 0n, isLoading, refetch };
}

/**
 * Hook to get ERC20 token balance
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
    query: { enabled: !!ownerAddress },
  });

  return { balance: balance ?? 0n, isLoading, refetch };
}
