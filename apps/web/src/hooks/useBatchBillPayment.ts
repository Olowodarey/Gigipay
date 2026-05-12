import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { keccak256, encodePacked, parseUnits, type Address } from "viem";
import { getContractAddress } from "@/lib/contracts";

const PAY_BILL_BATCH_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
      { internalType: "string", name: "serviceType", type: "string" },
      { internalType: "string", name: "serviceId", type: "string" },
      { internalType: "bytes32[]", name: "recipientHashes", type: "bytes32[]" },
    ],
    name: "payBillBatch",
    outputs: [
      { internalType: "uint256[]", name: "orderIds", type: "uint256[]" },
    ],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export interface BatchRecipient {
  phoneNumber: string;
  amountNgn: string; // Amount in NGN
  amountToken: string; // Amount in token (after conversion)
}

/**
 * Hook for batch paying bills (airtime, data, TV, electricity) via the Gigipay smart contract.
 * Sends payments to multiple recipients in ONE transaction.
 *
 * @example
 * ```ts
 * const { payBillBatch, hash, isPending, isConfirmed } = useBatchBillPayment();
 *
 * // Pay airtime to 3 people
 * payBillBatch(
 *   tokenAddress,
 *   recipients,
 *   18, // decimals
 *   "airtime",
 *   "01" // MTN
 * );
 * ```
 */
export function useBatchBillPayment() {
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

  /**
   * Pay bills for multiple recipients in one transaction
   *
   * @param tokenAddress - Token to pay with (0x0 for native)
   * @param recipients - Array of recipients with phone numbers and token amounts
   * @param decimals - Token decimals
   * @param serviceType - "airtime", "data", "tv", or "electricity"
   * @param serviceId - Network code (e.g., "01" for MTN) or service ID
   */
  const payBillBatch = (
    tokenAddress: Address,
    recipients: BatchRecipient[],
    decimals: number,
    serviceType: string,
    serviceId: string,
  ) => {
    if (!chain) throw new Error("No chain connected");
    if (recipients.length === 0) throw new Error("No recipients provided");
    if (recipients.length > 200)
      throw new Error("Maximum 200 recipients per batch");

    const contractAddress = getContractAddress(chain.id);

    // Convert amounts to wei/smallest unit
    const amounts = recipients.map((r) => parseUnits(r.amountToken, decimals));

    // Hash phone numbers for privacy
    const recipientHashes = recipients.map((r) =>
      keccak256(encodePacked(["string"], [r.phoneNumber])),
    );

    // Calculate total amount for native token
    const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0n);
    const isNative =
      tokenAddress === "0x0000000000000000000000000000000000000000";

    writeContract({
      address: contractAddress,
      abi: PAY_BILL_BATCH_ABI,
      functionName: "payBillBatch",
      args: [tokenAddress, amounts, serviceType, serviceId, recipientHashes],
      value: isNative ? totalAmount : 0n,
    });
  };

  return {
    payBillBatch,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  };
}
