"use client";

import { useState, useEffect } from "react";
import CreatePaymentStep1 from "@/components/create-payment/CreatePaymentStep1";
import CreatePaymentStep2 from "@/components/create-payment/CreatePaymentStep2";
import CreatePaymentStep3 from "@/components/create-payment/CreatePaymentStep3";
import { Check } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { useCreateVoucher, useCreateVoucherBatch } from "@/hooks/useVouchers";
import {
  useTokenBalance,
  useTokenApproval,
  useTokenAllowance,
} from "@/hooks/useTokenApproval";
import { formatUnits, parseUnits, Address } from "viem";
import {
  getTokenAddresses,
  getNativeTokenSymbol,
} from "@/lib/contracts/gigipay";

// Get available tokens for the current chain
const getAvailableTokens = (
  chainId?: number,
): Record<string, { symbol: string; name: string; icon: string }> => {
  if (!chainId) return {};

  try {
    const tokenAddresses = getTokenAddresses(chainId);

    // Map token addresses to token configs with proper metadata
    const tokensArray = Object.entries(tokenAddresses).map(
      ([symbol, address]) => {
        // Set icon based on token type
        let icon = "💰";
        if (symbol.includes("USD")) icon = "💵";
        if (symbol.includes("EUR")) icon = "💶";
        if (symbol === "CELO") icon = "🟡";
        if (symbol === "ETH") icon = "💎";

        return {
          symbol,
          name: symbol,
          icon,
        };
      },
    );

    // Convert array to object with symbol as key
    return tokensArray.reduce(
      (acc, token) => {
        acc[token.symbol] = token;
        return acc;
      },
      {} as Record<string, { symbol: string; name: string; icon: string }>,
    );
  } catch {
    return {};
  }
};

type TokenSymbol = string;

interface Winner {
  id: string;
  code: string;
  amount: string;
}

interface GiveawayData {
  name: string;
  totalPrize: string;
  expiryHours: string;
  selectedToken: TokenSymbol;
}

export default function CreatePage() {
  const [step, setStep] = useState(1);

  // Wagmi hooks - moved up to get chain info
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });

  // Get available tokens for current chain
  const availableTokens = getAvailableTokens(chain?.id);
  const nativeSymbol = chain?.id ? getNativeTokenSymbol(chain.id) : "ETH";
  const defaultToken = Object.keys(availableTokens)[0] || nativeSymbol;

  // Get token addresses for the current chain
  const tokenAddresses: Record<string, Address> = chain?.id
    ? getTokenAddresses(chain.id)
    : {};

  // Helper to get token decimals
  const getTokenDecimals = (symbol: string) => {
    if (symbol === "USDC" || symbol === "USDbC") return 6;
    return 18;
  };

  const [formData, setFormData] = useState<GiveawayData>({
    name: "",
    totalPrize: "",
    expiryHours: "0",
    selectedToken: defaultToken,
  });
  const [neverExpire, setNeverExpire] = useState(false);
  const [expiryValue, setExpiryValue] = useState("");
  const [expiryUnit, setExpiryUnit] = useState<"hours" | "days" | "weeks">(
    "hours",
  );
  const [winners, setWinners] = useState<Winner[]>([
    { id: "1", code: "", amount: "" },
  ]);
  const [createdVoucherIds, setCreatedVoucherIds] = useState<number[]>([]);
  const [needsApproval, setNeedsApproval] = useState(false);

  // Get token address and decimals for balance checking
  const selectedTokenAddress = tokenAddresses[formData.selectedToken] as
    | Address
    | undefined;
  const isNativeToken =
    !selectedTokenAddress ||
    selectedTokenAddress === "0x0000000000000000000000000000000000000000";

  const selectedTokenDecimals = getTokenDecimals(formData.selectedToken);

  // Balance hooks - native and ERC20
  const { balance: tokenBalance } = useTokenBalance(
    selectedTokenAddress || ("0x0" as Address),
    address,
  );

  // Voucher creation hooks
  const {
    createVoucher,
    isPending: isCreatingSingle,
    isConfirmed: isConfirmedSingle,
    hash: hashSingle,
    error: errorSingle,
  } = useCreateVoucher();
  const {
    createVoucherBatch,
    isPending: isCreatingBatch,
    isConfirmed: isConfirmedBatch,
    hash: hashBatch,
    error: errorBatch,
  } = useCreateVoucherBatch();

  // Token approval hooks (for ERC20 tokens)
  const {
    approve,
    isPending: isApproving,
    isConfirmed: isApprovalConfirmed,
  } = useTokenApproval(selectedTokenAddress || ("0x0" as Address));

  const { allowance, refetch: refetchAllowance } = useTokenAllowance(
    selectedTokenAddress || ("0x0" as Address),
    address,
  );

  // Combine states for UI
  const isCreating = isCreatingSingle || isCreatingBatch;
  const isConfirmed = isConfirmedSingle || isConfirmedBatch;
  const hash = hashSingle || hashBatch;
  const error = errorSingle || errorBatch;

  // Inline notice system
  const [notice, setNotice] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showToast = ({
    title,
    description,
    variant,
  }: {
    title?: string;
    description: string;
    variant?: "destructive";
  }) => {
    setNotice({
      type: variant === "destructive" ? "error" : "success",
      message: description || title || "",
    });
  };
  // UI-only: removed wallet/auth/blockchain dependencies

  // Shared input styles
  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  // Convert time value to hours based on unit
  const convertToHours = (
    value: string,
    unit: "hours" | "days" | "weeks",
  ): number => {
    const numValue = parseFloat(value) || 0;
    switch (unit) {
      case "hours":
        return numValue;
      case "days":
        return numValue * 24;
      case "weeks":
        return numValue * 24 * 7;
      default:
        return numValue;
    }
  };

  const getExpiryDescription = (
    value: string,
    unit: "hours" | "days" | "weeks",
  ): string => {
    const numValue = parseFloat(value) || 0;
    if (numValue === 0) return "No expiry set";

    const hours = convertToHours(value, unit);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (unit === "hours") {
      if (hours < 24) {
        return `Expires in ${numValue} hour${numValue !== 1 ? "s" : ""}`;
      } else {
        if (remainingHours === 0) {
          return `Expires in ${days} day${days !== 1 ? "s" : ""} (${hours} hours)`;
        } else {
          return `Expires in ${days} day${days !== 1 ? "s" : ""} and ${remainingHours} hour${remainingHours !== 1 ? "s" : ""} (${hours} hours)`;
        }
      }
    } else if (unit === "days") {
      return `Expires in ${numValue} day${numValue !== 1 ? "s" : ""} (${hours} hours)`;
    } else {
      return `Expires in ${numValue} week${numValue !== 1 ? "s" : ""} (${hours} hours)`;
    }
  };

  const handleInputChange = (field: keyof GiveawayData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addWinner = () => {
    const newId = (
      Math.max(...winners.map((w) => parseInt(w.id)), 0) + 1
    ).toString();
    setWinners([...winners, { id: newId, code: "", amount: "" }]);
  };

  const removeWinner = (id: string) => {
    if (winners.length > 1) {
      setWinners(winners.filter((w) => w.id !== id));
    }
  };

  const updateWinner = (id: string, field: keyof Winner, value: string) => {
    setWinners(
      winners.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
    );
  };

  const calculateTotalPrizes = () => {
    return winners.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  };

  const validateForm = () => {
    if (!formData.name || !formData.totalPrize || !formData.expiryHours) {
      showToast({
        title: "Missing Information",
        description:
          "Please fill in giveaway name, total prize and expiry time",
        variant: "destructive",
      });
      return false;
    }

    if (winners.some((w) => !w.code || !w.amount)) {
      showToast({
        title: "Incomplete Winners",
        description: "Please fill in all winner codes and amounts",
        variant: "destructive",
      });
      return false;
    }

    // Validate amounts are valid numbers
    if (
      winners.some(
        (w) => isNaN(parseFloat(w.amount)) || parseFloat(w.amount) <= 0,
      )
    ) {
      showToast({
        title: "Invalid Amount",
        description: "All winner amounts must be valid positive numbers",
        variant: "destructive",
      });
      return false;
    }

    const totalPrize = parseFloat(formData.totalPrize);
    const totalPrizes = calculateTotalPrizes();

    if (Math.abs(totalPrize - totalPrizes) > 0.01) {
      showToast({
        title: "Amount Mismatch",
        description: `Total prizes (${totalPrizes} ${formData.selectedToken}) must equal total prize pool (${totalPrize} ${formData.selectedToken})`,
        variant: "destructive",
      });
      return false;
    }

    // Check for duplicate codes
    const codes = winners.map((w) => w.code);
    const uniqueCodes = new Set(codes);
    if (codes.length !== uniqueCodes.size) {
      showToast({
        title: "Duplicate Codes",
        description: "Each winner must have a unique claim code",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateForm()) {
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Proceed to create giveaway
      handleCreateGiveaway();
    }
  };

  const handleCreateGiveaway = async () => {
    if (!isConnected) {
      showToast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create vouchers",
        variant: "destructive",
      });
      return;
    }

    // Check balance
    const totalAmount = calculateTotalPrizes();

    // Get current balance based on selected token
    let currentBalance = 0;
    if (isNativeToken) {
      currentBalance = balance ? parseFloat(formatUnits(balance.value, 18)) : 0;
    } else {
      currentBalance = tokenBalance
        ? parseFloat(formatUnits(tokenBalance, selectedTokenDecimals))
        : 0;
    }

    if (currentBalance < totalAmount) {
      showToast({
        title: "Insufficient Balance",
        description: `You need ${totalAmount} ${formData.selectedToken} but only have ${currentBalance.toFixed(selectedTokenDecimals === 6 ? 6 : 4)} ${formData.selectedToken}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate expiration timestamp from formData.expiryHours (which is already in hours)
      const hoursToExpire = parseFloat(formData.expiryHours) || 0;

      // For "never expire" (0 hours), set to far future (100 years from now)
      const expirationTime =
        hoursToExpire === 0
          ? Math.floor(Date.now() / 1000) + 100 * 365 * 24 * 60 * 60
          : Math.floor(Date.now() / 1000) + hoursToExpire * 60 * 60;

      console.log("Creating vouchers with:", {
        name: formData.name,
        winnersCount: winners.length,
        expiryHours: hoursToExpire,
        expirationTime,
        totalAmount,
        winners: winners.map((w) => ({ code: w.code, amount: w.amount })),
      });

      // Check if single or multiple vouchers
      // Get token address and decimals
      const selectedTokenAddress = (tokenAddresses[formData.selectedToken] ||
        "0x0000000000000000000000000000000000000000") as Address;
      const tokenDecimals = getTokenDecimals(formData.selectedToken);
      const isERC20 =
        selectedTokenAddress !== "0x0000000000000000000000000000000000000000";

      // For ERC20 tokens, check allowance and approve if needed
      if (isERC20) {
        const totalAmountBigInt = parseUnits(
          totalAmount.toString(),
          tokenDecimals,
        );

        // Refetch current allowance and get the fresh value
        const { data: currentAllowance } = await refetchAllowance();
        const allowanceToCheck = currentAllowance ?? allowance;

        console.log("Allowance check:", {
          currentAllowance: allowanceToCheck.toString(),
          required: totalAmountBigInt.toString(),
          sufficient: allowanceToCheck >= totalAmountBigInt,
        });

        // If allowance is insufficient, request approval first
        if (allowanceToCheck < totalAmountBigInt) {
          console.log("Insufficient allowance, requesting approval...");
          setNeedsApproval(true);
          showToast({
            title: "Approval Required",
            description: `Please approve the contract to spend ${totalAmount} ${formData.selectedToken}`,
          });

          // Request approval
          await approve(totalAmount.toString(), tokenDecimals);

          // Wait for approval confirmation
          showToast({
            title: "Waiting for Approval",
            description:
              "Please confirm the approval transaction in your wallet",
          });
          return; // Exit and let user try again after approval
        } else {
          // Allowance is sufficient, no approval needed
          console.log(
            "Allowance sufficient, proceeding with voucher creation...",
          );
          setNeedsApproval(false);
        }
      }

      if (winners.length === 1) {
        // Use createVoucher for single voucher
        const winner = winners[0];
        await createVoucher(
          selectedTokenAddress,
          formData.name,
          winner.code,
          winner.amount,
          expirationTime,
          tokenDecimals,
        );
      } else {
        // Use createVoucherBatch for multiple vouchers
        const vouchers = winners.map((w) => ({
          claimCode: w.code,
          amount: w.amount,
          expirationTime: expirationTime,
        }));
        await createVoucherBatch(
          selectedTokenAddress,
          formData.name,
          vouchers,
          tokenDecimals,
        );
      }
    } catch (err: any) {
      console.error("Error creating vouchers:", err);
      showToast({
        title: "Error",
        description: err.message || "Failed to create vouchers",
        variant: "destructive",
      });
    }
  };

  // Handle successful creation
  useEffect(() => {
    if (isConfirmed && hash) {
      showToast({
        title: "Success!",
        description: "Vouchers created successfully!",
      });
      setStep(3);
      setNeedsApproval(false); // Reset approval state
    }
  }, [isConfirmed, hash]);

  // Handle approval confirmation - update UI state
  useEffect(() => {
    if (isApprovalConfirmed) {
      showToast({
        title: "Approval Confirmed!",
        description: "You can now send the payment",
      });
      setNeedsApproval(false);
    }
  }, [isApprovalConfirmed]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast({
        title: "Error",
        description: error.message || "Transaction failed",
        variant: "destructive",
      });
    }
  }, [error]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const downloadCSV = () => {
    const csv = [
      "Code,Amount\n",
      ...winners.map((w) => `${w.code},${w.amount}\n`),
    ].join("");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "giveaway-codes.csv";
    a.click();
    showToast({
      title: "Downloaded!",
      description: "Codes exported to CSV",
    });
  };

  const getTweetTemplate = () => {
    const hoursToExpire = convertToHours(expiryValue, expiryUnit);
    return `🎉 ${formData.name} - Payment created 🎁

I'm giving away ${formData.totalPrize} ${formData.selectedToken} to ${
      winners.length
    } lucky winner${winners.length > 1 ? "s" : ""}!

💎 Prize amounts are HIDDEN until you claim!
⏰ Expires in ${hoursToExpire} hours
🔗 Claim at: /claim-payment

Use your voucher ID and code to claim!

#Gigipay #Celo #CryptoPayments`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          {notice && (
            <div
              className={`mb-6 rounded-md border p-3 text-sm ${
                notice.type === "error"
                  ? "border-destructive text-destructive-foreground bg-destructive/10"
                  : "border-border bg-muted/50 text-foreground"
              }`}
            >
              {notice.message}
            </div>
          )}
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {s > 1 && (
                      <div
                        className={`h-1 flex-1 rounded transition-colors ${
                          s <= step ? "bg-success" : "bg-muted"
                        }`}
                      />
                    )}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        s < step
                          ? "bg-success text-success-foreground"
                          : s === step
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      } ${s === 1 ? "ml-0" : "mx-2"} ${s === 3 ? "mr-0" : ""}`}
                    >
                      {s < step ? <Check className="h-4 w-4" /> : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`h-1 flex-1 rounded transition-colors ${
                          s < step ? "bg-success" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground mt-2">
                    {s === 1 ? "Setup" : s === 2 ? "Review" : "Complete"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Giveaway Details */}
          {step === 1 && (
            <CreatePaymentStep1
              formData={formData}
              onChange={handleInputChange}
              tokens={availableTokens}
              neverExpire={neverExpire}
              expiryValue={expiryValue}
              expiryUnit={expiryUnit}
              setNeverExpire={setNeverExpire}
              setExpiryValue={setExpiryValue}
              setExpiryUnit={setExpiryUnit}
              getExpiryDescription={getExpiryDescription}
              convertToHours={convertToHours}
              winners={winners}
              addWinner={addWinner}
              removeWinner={removeWinner}
              updateWinner={updateWinner}
              calculateTotalPrizes={calculateTotalPrizes}
              inputClass={inputClass}
              onNext={handleNextStep}
            />
          )}

          {/* Step 2: Preview & Confirm */}
          {step === 2 && (
            <CreatePaymentStep2
              formData={formData}
              tokens={availableTokens}
              winners={winners}
              isCreating={isCreating}
              isApproving={isApproving}
              needsApproval={needsApproval}
              isNativeToken={isNativeToken}
              onBack={() => setStep(1)}
              onConfirm={handleNextStep}
            />
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <CreatePaymentStep3
              winners={winners}
              selectedToken={formData.selectedToken}
              copyToClipboard={copyToClipboard}
              downloadCSV={downloadCSV}
              getTweetTemplate={getTweetTemplate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
