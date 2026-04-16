import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { keccak256, encodePacked, parseUnits, type Address } from "viem";
import { getContractAddress } from "@/lib/contracts";

const PAY_BILL_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "serviceType", type: "string" },
      { internalType: "string", name: "serviceId", type: "string" },
      { internalType: "bytes32", name: "recipientHash", type: "bytes32" },
    ],
    name: "payBill",
    outputs: [{ internalType: "uint256", name: "orderId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export const NETWORKS = [
  { code: "01", name: "MTN", color: "bg-yellow-400 text-yellow-900" },
  { code: "02", name: "GLO", color: "bg-green-500 text-white" },
  { code: "03", name: "9mobile", color: "bg-emerald-600 text-white" },
  { code: "04", name: "Airtel", color: "bg-red-500 text-white" },
] as const;

export type NetworkCode = "01" | "02" | "03" | "04";

export function usePayBillAirtime() {
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

  const payAirtime = (
    tokenAddress: Address,
    amountStr: string,
    decimals: number,
    networkCode: NetworkCode,
    phoneNumber: string,
  ) => {
    if (!chain) throw new Error("No chain connected");
    const contractAddress = getContractAddress(chain.id);

    const amount = parseUnits(amountStr, decimals);
    const recipientHash = keccak256(encodePacked(["string"], [phoneNumber]));
    const isNative =
      tokenAddress === "0x0000000000000000000000000000000000000000";

    writeContract({
      address: contractAddress,
      abi: PAY_BILL_ABI,
      functionName: "payBill",
      args: [tokenAddress, amount, "airtime", networkCode, recipientHash],
      value: isNative ? amount : 0n,
    });
  };

  return {
    payAirtime,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  };
}
