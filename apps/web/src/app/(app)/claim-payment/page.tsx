"use client";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gift, Sparkles, ExternalLink, AlertCircle, Copy } from "lucide-react";
import Confetti from "react-confetti";
import { useAccount, useBalance } from "wagmi";
import {
  useClaimVoucher,
  useVouchersByName,
  useVoucherDetails,
} from "@/hooks/useVouchers";
import { formatUnits, Address } from "viem";
import { useTokenBalance } from "@/hooks/useTokenApproval";
import {
  getTokenAddresses,
  getNativeTokenSymbol,
} from "@/lib/contracts/gigipay";
import { ClientOnly } from "@/components/batch-payment/ClientOnly";

type ClaimState = "initial" | "valid" | "invalid" | "claimed";

function ClaimPageContent() {
  const [claimCode, setClaimCode] = useState("");
  const [claimState, setClaimState] = useState<ClaimState>("initial");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [voucherName, setVoucherName] = useState("");
  const [voucherId, setVoucherId] = useState<number | null>(null);
  const [tokenAddress, setTokenAddress] = useState<Address | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState("CELO");

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const {
    claimVoucher,
    isPending: isClaiming,
    isConfirmed,
    hash,
    error,
  } = useClaimVoucher();
  const { voucherIds, isLoading: isLoadingVouchers } =
    useVouchersByName(voucherName);

  // Get voucher details when we have a voucher ID
  const { voucher, refetch: refetchVoucher } = useVoucherDetails(
    voucherId || 0,
  );

  // Balance hooks
  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
    address,
  });
  const { balance: tokenBalance, refetch: refetchTokenBalance } =
    useTokenBalance(tokenAddress || ("0x0" as Address), address);

  // Inline notice to replace toasts
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
    // auto-hide after 3s
    setTimeout(() => setNotice(null), 3000);
  };

  // Local window size for confetti (replaces useWindowSize hook)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const update = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Shared input styles
  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  // Get chain name for display
  const getChainName = () => {
    if (!chain?.id) return "supported network";
    if (chain.id === 42220) return "Celo Mainnet";
    if (chain.id === 8453) return "Base Mainnet";
    return chain.name || "supported network";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Copied to clipboard" });
  };

  const getShareTemplate = () =>
    `🎊 I just received ${prizeAmount} ${tokenSymbol} on Gigipay! 🎉\n\nGigipay makes crypto payments simple and secure on ${getChainName()}! \n\nTry Gigipay for seamless crypto payments! 🎁\n\n#Gigipay #CryptoPayments`;

  const validateCode = () => {
    if (!voucherName.trim()) {
      toast({
        title: "Missing Voucher Name",
        description: "Please enter the voucher name",
        variant: "destructive",
      });
      return;
    }

    if (!claimCode.trim()) {
      toast({
        title: "Missing Code",
        description: "Please enter a claim code",
        variant: "destructive",
      });
      return;
    }

    // Check if voucher exists
    if (voucherIds.length === 0) {
      toast({
        title: "Invalid Voucher",
        description: "No vouchers found with this name",
        variant: "destructive",
      });
      setClaimState("invalid");
      return;
    }

    // Set the first voucher ID to fetch details
    setVoucherId(Number(voucherIds[0]));
    setClaimState("valid");
    setPrizeAmount("???");
  };

  const handleClaim = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to claim",
        variant: "destructive",
      });
      return;
    }

    // Check if voucher is already claimed
    if (voucher?.claimed) {
      toast({
        title: "Already Claimed",
        description: "This voucher has already been claimed",
        variant: "destructive",
      });
      return;
    }

    // Check if voucher is expired
    if (voucher?.expiresAt) {
      const now = BigInt(Math.floor(Date.now() / 1000));
      if (voucher.expiresAt < now) {
        toast({
          title: "Voucher Expired",
          description: "This voucher has expired and can no longer be claimed",
          variant: "destructive",
        });
        return;
      }
    }

    // Check if voucher is refunded
    if (voucher?.refunded) {
      toast({
        title: "Voucher Refunded",
        description: "This voucher has been refunded by the sender",
        variant: "destructive",
      });
      return;
    }

    try {
      await claimVoucher(voucherName, claimCode);
    } catch (err: any) {
      toast({
        title: "Claim Failed",
        description: err.message || "Failed to claim voucher",
        variant: "destructive",
      });
    }
  };

  // Handle successful claim
  useEffect(() => {
    if (isConfirmed && hash) {
      setTxHash(hash);
      setClaimState("claimed");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      toast({ description: "Your payment has been successfully received!" });

      // Refresh balances
      refetchNativeBalance();
      refetchTokenBalance();
      refetchVoucher();
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
      setClaimState("invalid");
    }
  }, [error]);

  // Fetch voucher details when voucher ID is set
  useEffect(() => {
    if (voucher && voucher.amount && voucher.token && chain?.id) {
      try {
        // Determine token info
        const chainId = chain.id;
        const tokenAddresses = getTokenAddresses(chainId);
        const nativeSymbol = getNativeTokenSymbol(chainId);

        // Find which token this voucher uses by matching the address
        let symbol = nativeSymbol;
        let decimals = 18;
        const voucherTokenAddress = voucher.token.toLowerCase();

        // Check if it's the native token (address(0))
        const isNativeToken =
          voucherTokenAddress === "0x0000000000000000000000000000000000000000";

        if (isNativeToken) {
          symbol = nativeSymbol;
          decimals = 18;
        } else {
          // Find the matching token from the token addresses
          for (const [tokenSymbol, address] of Object.entries(tokenAddresses)) {
            if ((address as string).toLowerCase() === voucherTokenAddress) {
              symbol = tokenSymbol;
              // Set decimals based on token type
              decimals =
                tokenSymbol === "USDC" ||
                tokenSymbol === "USDbC" ||
                tokenSymbol === "USDT"
                  ? 6
                  : 18;
              break;
            }
          }
        }

        setTokenAddress(voucher.token);
        setTokenSymbol(symbol);

        // Format the amount
        const formattedAmount = formatUnits(voucher.amount, decimals);
        setPrizeAmount(formattedAmount);
      } catch (error) {
        console.error("Error fetching voucher details:", error);
        setPrizeAmount("???");
      }
    }
  }, [voucher, chain]);

  // Get current balance display
  const getBalanceDisplay = () => {
    if (!address) return "Connect wallet";

    const isNativeToken =
      !tokenAddress ||
      tokenAddress === "0x0000000000000000000000000000000000000000";

    if (isNativeToken) {
      if (nativeBalance?.formatted !== undefined) {
        return `${parseFloat(nativeBalance.formatted).toFixed(4)} ${tokenSymbol}`;
      }
      return `0.0000 ${tokenSymbol}`;
    }

    if (tokenBalance !== undefined) {
      const decimals =
        tokenSymbol === "USDC" || tokenSymbol === "USDbC" ? 6 : 18;
      return `${parseFloat(formatUnits(tokenBalance, decimals)).toFixed(4)} ${tokenSymbol}`;
    }

    return `0.0000 ${tokenSymbol}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="flex-1 py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-lg">
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
          {/* Initial State */}
          {claimState === "initial" && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Gift className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Claim Your Payment</CardTitle>
                <CardDescription>
                  Enter your claim code to receive your payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="voucherName" className="text-sm font-medium">
                    Voucher Name
                  </label>
                  <input
                    id="voucherName"
                    type="text"
                    placeholder="e.g., Summer Giveaway"
                    value={voucherName}
                    onChange={(e) =>
                      setVoucherName((e.target as HTMLInputElement).value)
                    }
                    className={`${inputClass} text-center`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the voucher name from the giveaway
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="claimCode" className="text-sm font-medium">
                    Claim Code
                  </label>
                  <input
                    id="claimCode"
                    placeholder="STRK-XXXXXXXX"
                    value={claimCode}
                    onChange={(e) =>
                      setClaimCode((e.target as HTMLInputElement).value)
                    }
                    className={`${inputClass} font-mono text-center text-lg`}
                  />
                </div>
                <Button onClick={validateCode} className="w-full" size="lg">
                  Validate Code
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Invalid Code State */}
          {claimState === "invalid" && (
            <Card className="border-destructive">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl">
                  Invalid Code or Payment
                </CardTitle>
                <CardDescription>
                  This payment or code doesn't exist, or has already been
                  claimed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
                  <p className="text-sm text-center text-foreground">
                    <strong>Voucher Name:</strong>{" "}
                    <span className="font-mono font-semibold">
                      {voucherName}
                    </span>
                  </p>
                  <p className="text-sm text-center text-foreground">
                    <strong>Code:</strong>{" "}
                    <span className="font-mono font-semibold">{claimCode}</span>
                  </p>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Please verify:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• The voucher name is correct</li>
                    <li>• The claim code hasn't been used already</li>
                    <li>
                      • <strong>Each code can only be claimed once</strong>
                    </li>
                    <li>• The voucher exists on-chain and hasn't expired</li>
                  </ul>
                </div>
                <Button
                  onClick={() => {
                    setClaimState("initial");
                    setVoucherName("");
                    setClaimCode("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Another Code
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Valid Code State */}
          {claimState === "valid" && (
            <Card className="border-accent">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-2xl">Payment Available!</CardTitle>
                <CardDescription>
                  Connect your wallet to claim your payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    Payment Amount
                  </div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                    {prizeAmount !== "???" ? prizeAmount : "???"}
                  </div>
                  <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                    {tokenSymbol}
                  </div>
                </div>

                {/* Show current balance */}
                {isConnected && (
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Your Balance
                      </span>
                      <span className="text-sm font-semibold">
                        {getBalanceDisplay()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Voucher Status Warnings */}
                {voucher && (
                  <>
                    {voucher.claimed && (
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-semibold">Already Claimed</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          This voucher has already been claimed and cannot be
                          claimed again.
                        </p>
                      </div>
                    )}
                    {voucher.expiresAt &&
                      voucher.expiresAt <
                        BigInt(Math.floor(Date.now() / 1000)) && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                          <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-semibold">
                              Voucher Expired
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            This voucher has expired and can no longer be
                            claimed.
                          </p>
                        </div>
                      )}
                    {voucher.refunded && (
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-semibold">
                            Voucher Refunded
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          This voucher has been refunded by the sender.
                        </p>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-3">
                  {!isConnected ? (
                    <p className="text-sm text-center text-muted-foreground">
                      Please connect your wallet to claim
                    </p>
                  ) : (
                    <Button
                      onClick={handleClaim}
                      className="w-full"
                      size="lg"
                      disabled={
                        isClaiming ||
                        voucher?.claimed ||
                        voucher?.refunded ||
                        Boolean(
                          voucher?.expiresAt &&
                          voucher.expiresAt <
                            BigInt(Math.floor(Date.now() / 1000)),
                        )
                      }
                    >
                      {isClaiming
                        ? "Claiming..."
                        : voucher?.claimed
                          ? "Already Claimed"
                          : voucher?.refunded
                            ? "Refunded"
                            : voucher?.expiresAt &&
                                voucher.expiresAt <
                                  BigInt(Math.floor(Date.now() / 1000))
                              ? "Expired"
                              : "Claim Payment"}
                    </Button>
                  )}
                  <p className="text-xs text-center text-muted-foreground">
                    Gas fees apply on {getChainName()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Claimed State */}
          {claimState === "claimed" && (
            <Card className="border-success">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <Gift className="h-8 w-8 text-success" />
                </div>
                <CardTitle className="text-2xl">Congratulations!</CardTitle>
                <CardDescription>
                  Your payment has been claimed successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-8 rounded-lg bg-gradient-to-br from-success/10 to-accent/10 border border-success/20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                      <Gift className="h-8 w-8 text-success" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-success mb-1">
                        Payment Received!
                      </div>
                      <div className="text-4xl font-bold text-accent my-3">
                        +{prizeAmount} {tokenSymbol}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Your payment has been successfully claimed
                      </div>
                    </div>
                  </div>
                </div>

                {/* Show updated balance */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Updated Balance
                    </span>
                    <span className="text-sm font-semibold">
                      {getBalanceDisplay()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-muted-foreground">
                      Transaction
                    </span>
                    <a
                      href={`https://celoscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-accent hover:underline flex items-center gap-1 break-all text-right"
                    >
                      {txHash.substring(0, 10)}...
                      {txHash.substring(txHash.length - 8)}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">
                    Share Template
                  </h4>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                      {getShareTemplate()}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(getShareTemplate())}
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Template
                  </Button>
                  <Button
                    onClick={() => {
                      setClaimState("initial");
                      setVoucherName("");
                      setClaimCode("");
                      setPrizeAmount("");
                      setTxHash("");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Claim Another Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
            <h3 className="font-semibold text-foreground mb-2 text-sm">
              How to claim vouchers
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
              <li>• Get voucher name and claim code from the sender</li>
              <li>• Connect your wallet to {getChainName()}</li>
              <li>
                • Enter the voucher name and claim code to receive {tokenSymbol}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <ClientOnly>
      <ClaimPageContent />
    </ClientOnly>
  );
}
