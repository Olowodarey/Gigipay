import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseUnits, type Address } from "viem";
import { getContractAddress } from "@/lib/contracts";

const WITHDRAW_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdrawBillFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function useWithdrawBillFunds() {
  const { chain } = useAccount();
  const {
    data: hash,
    writeContract,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const withdraw = (
    tokenAddress: Address,
    toAddress: Address,
    amount: string,
    decimals: number,
  ) => {
    if (!chain) throw new Error("No chain connected");
    writeContract({
      address: getContractAddress(chain.id),
      abi: WITHDRAW_ABI,
      functionName: "withdrawBillFunds",
      args: [tokenAddress, toAddress, parseUnits(amount, decimals)],
    });
  };

  return { withdraw, hash, isPending, isConfirming, isConfirmed, error, reset };
}
