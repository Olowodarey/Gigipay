"use client";

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
import { useAccount } from "wagmi";
import { useClaimVoucher, useVouchersByName } from "@/hooks/useVouchers";
import { formatUnits } from "viem";

type ClaimState = "initial" | "valid" | "invalid" | "claimed";

export default function ClaimPage() {
  const [claimCode, setClaimCode] = useState("");
  const [claimState, setClaimState] = useState<ClaimState>("initial");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [voucherName, setVoucherName] = useState("");
  
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { claimVoucher, isPending: isClaiming, isConfirmed, hash, error } = useClaimVoucher();
  const { voucherIds, isLoading: isLoadingVouchers } = useVouchersByName(voucherName);

  // Inline notice to replace toasts
  const [notice, setNotice] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const toast = ({ title, description, variant }: { title?: string; description: string; variant?: "destructive" }) => {
    setNotice({ type: variant === "destructive" ? "error" : "success", message: description || title || "" });
    // auto-hide after 3s
    setTimeout(() => setNotice(null), 3000);
  };

  // Local window size for confetti (replaces useWindowSize hook)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Shared input styles
  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Copied to clipboard" });
  };

  const getShareTemplate = () => `🎊 I just received ${prizeAmount} CELO on Gigipay! 🎉\n\nGigipay makes crypto payments simple and secure on Celo blockchain! \n\nTry Gigipay for seamless crypto payments! 🎁\n\n#Gigipay #Celo #CryptoPayments`;

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

    setClaimState("valid");
    // Note: Amount will be revealed after claiming
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

  return (
    <div className="flex flex-col min-h-screen">
      {showConfetti && (
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />
      )}

      <div className="flex-1 py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-lg">
          {notice && (
            <div
              className={`mb-6 rounded-md border p-3 text-sm ${
                notice.type === "error" ? "border-destructive text-destructive-foreground bg-destructive/10" : "border-border bg-muted/50 text-foreground"
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
                  <label htmlFor="voucherName" className="text-sm font-medium">Voucher Name</label>
                  <input
                    id="voucherName"
                    type="text"
                    placeholder="e.g., Summer Giveaway"
                    value={voucherName}
                    onChange={(e) => setVoucherName((e.target as HTMLInputElement).value)}
                    className={`${inputClass} text-center`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the voucher name from the giveaway
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="claimCode" className="text-sm font-medium">Claim Code</label>
                  <input
                    id="claimCode"
                    placeholder="STRK-XXXXXXXX"
                    value={claimCode}
                    onChange={(e) => setClaimCode((e.target as HTMLInputElement).value)}
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
                  <div className="text-5xl font-bold text-accent mb-2">???</div>
                  <div className="text-sm text-muted-foreground">CELO</div>
                </div>

                <div className="space-y-3">
                  {!isConnected ? (
                    <p className="text-sm text-center text-muted-foreground">
                      Please connect your wallet to claim
                    </p>
                  ) : (
                    <Button onClick={handleClaim} className="w-full" size="lg" disabled={isClaiming}>
                      {isClaiming ? "Claiming..." : "Claim Payment"}
                    </Button>
                  )}
                  <p className="text-xs text-center text-muted-foreground">
                    Gas fees apply on Celo Sepolia testnet
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
                      <div className="text-sm text-muted-foreground">
                        Your payment has been successfully claimed
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-sm text-muted-foreground">
                      Transaction
                    </span>
                    <a
                      href={`https://alfajores.celoscan.io/tx/${txHash}`}
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
                  <h4 className="font-semibold text-foreground">Share Template</h4>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                      {getShareTemplate()}
                    </p>
                  </div>
                  <Button onClick={() => copyToClipboard(getShareTemplate())} variant="outline" className="w-full">
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
              <li>• Connect your wallet to Celo Sepolia network</li>
              <li>• Enter the voucher name and claim code to receive CELO</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Footer removed for UI-only page */}
    </div>
  );
}
