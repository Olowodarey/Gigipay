
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
// UI-only page: removed Starknet/wallet/auth/share dependencies

type ClaimState = "initial" | "valid" | "invalid" | "claimed";

export default function ClaimPage() {
  const [claimCode, setClaimCode] = useState("");
  const [claimState, setClaimState] = useState<ClaimState>("initial");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [giveawayName, setGiveawayName] = useState(""); // Giveaway name instead of ID

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

  const getShareTemplate = () => `🎊 I just received a payment from "${giveawayName}" on Gigi Pay! 🎉\n\nGigi Pay makes crypto payments simple - just Gmail needed, no wallet setup required! \n\nTry Gigi Pay for seamless crypto payments! 🎁\n\n#GigiPay #Starknet #CryptoPayments`;

  const validateCode = () => {
    if (!giveawayName.trim()) {
      toast({
        title: "Missing Giveaway Name",
        description: "Please enter the giveaway name",
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

    // For now, just mark as valid - actual validation happens on-chain
    setClaimState("valid");
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      // Simulate processing delay
      await new Promise((r) => setTimeout(r, 1000));
      const amount = (Math.random() * 10 + 1).toFixed(2);
      setPrizeAmount(amount);
      // Fake tx hash
      const fakeHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0").slice(0, 64);
      setTxHash(fakeHash);
      setClaimState("claimed");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      toast({ description: "Your payment has been successfully received!" });
    } finally {
      setIsClaiming(false);
    }
  };

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
                  <label htmlFor="giveawayName" className="text-sm font-medium">Payment Name</label>
                  <input
                    id="giveawayName"
                    type="text"
                    placeholder="e.g., MyGiveaway"
                    value={giveawayName}
                    onChange={(e) => setGiveawayName((e.target as HTMLInputElement).value)}
                    className={`${inputClass} text-center`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the giveaway name you want to claim from
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
                    <strong>Payment:</strong>{" "}
                    <span className="font-mono font-semibold">
                      {giveawayName}
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
                    <li>• The payment name is spelled correctly</li>
                    <li>• The claim code hasn't been used already</li>
                    <li>
                      • <strong>Each code can only be claimed once</strong>
                    </li>
                    <li>• The payment exists on-chain</li>
                  </ul>
                </div>
                <Button
                  onClick={() => {
                    setClaimState("initial");
                    setGiveawayName("");
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
                  <div className="text-sm text-muted-foreground">STRK</div>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleClaim} className="w-full" size="lg" disabled={isClaiming}>
                    {isClaiming ? "Claiming..." : "Claim Payment"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    No gas fees required - completely free to claim
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
                      href={`https://starkscan.co/tx/${txHash}`}
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
                      setGiveawayName("");
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
              How to find claim codes
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
              <li>• Get claim codes from payment creators</li>
              <li>• Look for posts or messages containing claim codes</li>
              <li>• Enter the code here to claim your payment</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Footer removed for UI-only page */}
    </div>
  );
}
