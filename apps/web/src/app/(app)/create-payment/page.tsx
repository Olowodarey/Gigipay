"use client";

import { useState, useEffect } from "react";
import CreatePaymentStep1 from "@/components/create-payment/CreatePaymentStep1";
import CreatePaymentStep2 from "@/components/create-payment/CreatePaymentStep2";
import CreatePaymentStep3 from "@/components/create-payment/CreatePaymentStep3";
import { Check } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { useCreateVoucher, useCreateVoucherBatch } from "@/hooks/useVouchers";
import { formatUnits } from "viem";

// Token config - only CELO for now
const TOKENS = {
  CELO: { symbol: "CELO", name: "Celo", icon: "🟡" },
} as const;
type TokenSymbol = keyof typeof TOKENS;

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
  const [formData, setFormData] = useState<GiveawayData>({
    name: "",
    totalPrize: "",
    expiryHours: "0",
    selectedToken: "CELO",
  });
  const [neverExpire, setNeverExpire] = useState(false);
  const [expiryValue, setExpiryValue] = useState("");
  const [expiryUnit, setExpiryUnit] = useState<"hours" | "days" | "weeks">(
    "hours"
  );
  const [winners, setWinners] = useState<Winner[]>([
    { id: "1", code: "", amount: "" },
  ]);
  const [createdVoucherIds, setCreatedVoucherIds] = useState<number[]>([]);
  
  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { createVoucher, isPending: isCreatingSingle, isConfirmed: isConfirmedSingle, hash: hashSingle, error: errorSingle } = useCreateVoucher();
  const { createVoucherBatch, isPending: isCreatingBatch, isConfirmed: isConfirmedBatch, hash: hashBatch, error: errorBatch } = useCreateVoucherBatch();
  
  // Combine states for UI
  const isCreating = isCreatingSingle || isCreatingBatch;
  const isConfirmed = isConfirmedSingle || isConfirmedBatch;
  const hash = hashSingle || hashBatch;
  const error = errorSingle || errorBatch;

  // Inline notice system to replace toast
  const [notice, setNotice] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const toast = ({
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
    unit: "hours" | "days" | "weeks"
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
    unit: "hours" | "days" | "weeks"
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
      winners.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const calculateTotalPrizes = () => {
    return winners.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  };

  const validateForm = () => {
    if (!formData.name || !formData.totalPrize || !formData.expiryHours) {
      toast({
        title: "Missing Information",
        description:
          "Please fill in giveaway name, total prize and expiry time",
        variant: "destructive",
      });
      return false;
    }

    if (winners.some((w) => !w.code || !w.amount)) {
      toast({
        title: "Incomplete Winners",
        description: "Please fill in all winner codes and amounts",
        variant: "destructive",
      });
      return false;
    }

    // Validate amounts are valid numbers
    if (winners.some((w) => isNaN(parseFloat(w.amount)) || parseFloat(w.amount) <= 0)) {
      toast({
        title: "Invalid Amount",
        description: "All winner amounts must be valid positive numbers",
        variant: "destructive",
      });
      return false;
    }

    const totalPrize = parseFloat(formData.totalPrize);
    const totalPrizes = calculateTotalPrizes();

    if (Math.abs(totalPrize - totalPrizes) > 0.01) {
      toast({
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
      toast({
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
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create vouchers",
        variant: "destructive",
      });
      return;
    }

    // Check balance
    const totalAmount = calculateTotalPrizes();
    if (balance && parseFloat(formatUnits(balance.value, 18)) < totalAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${totalAmount} CELO but only have ${formatUnits(balance.value, 18)} CELO`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate expiration timestamp from formData.expiryHours (which is already in hours)
      const hoursToExpire = parseFloat(formData.expiryHours) || 0;
      
      // For "never expire" (0 hours), set to far future (100 years from now)
      const expirationTime = hoursToExpire === 0 
        ? Math.floor(Date.now() / 1000) + (100 * 365 * 24 * 60 * 60)
        : Math.floor(Date.now() / 1000) + (hoursToExpire * 60 * 60);
      
      console.log('Creating vouchers with:', {
        name: formData.name,
        winnersCount: winners.length,
        expiryHours: hoursToExpire,
        expirationTime,
        totalAmount,
        winners: winners.map(w => ({ code: w.code, amount: w.amount }))
      });
      
      // Check if single or multiple vouchers
      if (winners.length === 1) {
        // Use createVoucher for single voucher
        const winner = winners[0];
        await createVoucher(
          formData.name,
          winner.code,
          winner.amount,
          expirationTime
        );
      } else {
        // Use createVoucherBatch for multiple vouchers
        const vouchers = winners.map(w => ({
          claimCode: w.code,
          amount: w.amount,
          expirationTime: expirationTime,
        }));
        await createVoucherBatch(formData.name, vouchers);
      }
    } catch (err: any) {
      console.error('Error creating vouchers:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to create vouchers",
        variant: "destructive",
      });
    }
  };

  // Handle successful creation
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Success!",
        description: "Vouchers created successfully!",
      });
      setStep(3);
    }
  }, [isConfirmed, hash]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error.message || "Transaction failed",
        variant: "destructive",
      });
    }
  }, [error]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
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
    toast({
      title: "Downloaded!",
      description: "Codes exported to CSV",
    });
  };

  const getTweetTemplate = () => {
    const hoursToExpire = convertToHours(expiryValue, expiryUnit);
    return `🎉 ${formData.name} - Payment Giveaway! 🎁

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
                notice.type === "error" ? "border-destructive text-destructive-foreground bg-destructive/10" : "border-border bg-muted/50 text-foreground"
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
              tokens={TOKENS}
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
              tokens={TOKENS}
              winners={winners}
              isCreating={isCreating}
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
