"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits, parseUnits, type Address } from "viem";
import { ClientOnly } from "@/components/batch-payment/ClientOnly";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  usePayBillAirtime,
  NETWORKS,
  type NetworkCode,
} from "@/hooks/useAirtime";
import {
  useTokenBalance,
  useTokenApproval,
  useTokenAllowance,
} from "@/hooks/useTokenApproval";
import { useRate } from "@/hooks/useRate";
import { registerAirtimeOrder, type AirtimeOrderStatus } from "@/lib/api";

// ─── Token config per chain ───────────────────────────────────────────────────

const TOKEN_ADDRESSES: Record<number, Record<string, Address>> = {
  42220: {
    CELO: "0x0000000000000000000000000000000000000000",
    cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    USDT: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
  },
  8453: {
    ETH: "0x0000000000000000000000000000000000000000",
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
};

const TOKEN_DECIMALS: Record<string, number> = {
  USDC: 6,
  USDbC: 6,
  USDT: 6,
};

function getDecimals(symbol: string) {
  return TOKEN_DECIMALS[symbol] ?? 18;
}

// ─── Page shell (ClientOnly guard) ───────────────────────────────────────────

export default function BuyAirtimePage() {
  return (
    <ClientOnly>
      <BuyAirtimeContent />
    </ClientOnly>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function BuyAirtimeContent() {
  const { address, isConnected, chain } = useAccount();
  const { data: nativeBalance } = useBalance({ address });

  const tokens = chain?.id ? (TOKEN_ADDRESSES[chain.id] ?? {}) : {};
  const tokenSymbols = Object.keys(tokens);
  const defaultToken = tokenSymbols[0] ?? "CELO";

  const [selectedToken, setSelectedToken] = useState(defaultToken);
  const [networkCode, setNetworkCode] = useState<NetworkCode>("01");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<AirtimeOrderStatus | null>(
    null,
  );
  const [notice, setNotice] = useState<{
    type: "error" | "success" | "info";
    msg: string;
  } | null>(null);

  // Reset token when chain changes
  useEffect(() => {
    const syms = chain?.id ? Object.keys(TOKEN_ADDRESSES[chain.id] ?? {}) : [];
    if (syms.length) setSelectedToken(syms[0]);
  }, [chain?.id]);

  const tokenAddress = (tokens[selectedToken] ??
    "0x0000000000000000000000000000000000000000") as Address;
  const isNative =
    tokenAddress === "0x0000000000000000000000000000000000000000";
  const decimals = getDecimals(selectedToken);

  // Balances
  const { balance: erc20Balance } = useTokenBalance(tokenAddress, address);
  const displayBalance = isNative
    ? nativeBalance
      ? parseFloat(formatUnits(nativeBalance.value, 18))
      : 0
    : parseFloat(formatUnits(erc20Balance, decimals));

  // Approval
  const {
    approve,
    isPending: isApproving,
    isConfirmed: approvalConfirmed,
  } = useTokenApproval(tokenAddress);
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(
    tokenAddress,
    address,
  );

  // payBill hook
  const {
    payAirtime,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    reset,
  } = usePayBillAirtime();

  // Live NGN → token conversion
  const {
    tokenAmount,
    rate,
    coinId,
    isLoading: rateLoading,
    error: rateError,
  } = useRate(chain?.id, amount);

  const selectedNetwork = NETWORKS.find((n) => n.code === networkCode)!;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const showNotice = (type: "error" | "success" | "info", msg: string) =>
    setNotice({ type, msg });

  const validate = () => {
    if (!isConnected) {
      showNotice("error", "Connect your wallet first");
      return false;
    }
    if (!phone.trim() || !/^0[7-9][01]\d{8}$/.test(phone.trim())) {
      showNotice(
        "error",
        "Enter a valid Nigerian mobile number (e.g. 08012345678)",
      );
      return false;
    }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt < 50) {
      showNotice("error", "Minimum airtime amount is ₦50");
      return false;
    }
    if (amt > 200000) {
      showNotice("error", "Maximum airtime amount is ₦200,000");
      return false;
    }
    if (!tokenAmount) {
      showNotice("error", "Waiting for exchange rate — try again in a moment");
      return false;
    }
    if (displayBalance < parseFloat(tokenAmount)) {
      showNotice("error", `Insufficient ${selectedToken} balance`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || !tokenAmount) return;
    setNotice(null);

    try {
      // ERC20 approval check
      if (!isNative) {
        const required = parseUnits(tokenAmount, decimals);
        const { data: fresh } = await refetchAllowance();
        const current = fresh ?? allowance;
        if (current < required) {
          showNotice("info", "Approving token spend — confirm in your wallet");
          approve(tokenAmount, decimals);
          return;
        }
      }

      payAirtime(
        tokenAddress,
        tokenAmount,
        decimals,
        networkCode,
        phone.trim(),
      );
    } catch (err: any) {
      showNotice("error", err.message ?? "Transaction failed");
    }
  };

  // After approval confirmed, re-submit
  useEffect(() => {
    if (approvalConfirmed && tokenAmount) {
      showNotice("info", "Approval confirmed — submitting payment…");
      payAirtime(
        tokenAddress,
        tokenAmount,
        decimals,
        networkCode,
        phone.trim(),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalConfirmed]);

  useEffect(() => {
    if (error) showNotice("error", error.message ?? "Transaction failed");
  }, [error]);

  // Register order with backend after tx confirms so it can fulfill the airtime
  useEffect(() => {
    if (!isConfirmed || !hash || !chain?.id || !tokenAmount) return;

    registerAirtimeOrder({
      chainId: chain.id,
      networkCode,
      phoneNumber: phone.trim(),
      amountNgn: parseFloat(amount),
      txHash: hash,
    })
      .then((order) => {
        setOrderId(order.id);
        setOrderStatus(order);
      })
      .catch((err) => {
        // Non-fatal — tx already succeeded on-chain
        console.error("Failed to register order with backend:", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, hash]);

  // Poll order status until fulfilled or failed
  useEffect(() => {
    if (!orderId) return;
    if (orderStatus?.status === "fulfilled" || orderStatus?.status === "failed")
      return;

    const interval = setInterval(async () => {
      try {
        const updated = await getAirtimeOrderStatus(orderId);
        setOrderStatus(updated);
        if (updated.status === "fulfilled" || updated.status === "failed") {
          clearInterval(interval);
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId, orderStatus?.status]);

  const explorerBase =
    chain?.id === 42220
      ? "https://celoscan.io/tx/"
      : "https://basescan.org/tx/";

  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

  const isBusy = isPending || isConfirming || isApproving;

  // ─── Success state ──────────────────────────────────────────────────────────

  if (isConfirmed && hash) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-lg">
            <Card>
              <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h2 className="text-xl font-semibold">Payment Submitted!</h2>
                <p className="text-muted-foreground text-sm">
                  Your airtime purchase for{" "}
                  <span className="font-medium">{phone}</span> on{" "}
                  <span className="font-medium">{selectedNetwork.name}</span>{" "}
                  has been sent to the contract. The airtime will be delivered
                  shortly.
                </p>

                {orderStatus && (
                  <div
                    className={`w-full rounded-md border px-3 py-2 text-sm text-center ${
                      orderStatus.status === "fulfilled"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : orderStatus.status === "failed"
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-border bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {orderStatus.status === "fulfilled" &&
                      "✅ Airtime delivered!"}
                    {orderStatus.status === "failed" &&
                      `❌ Delivery failed: ${orderStatus.providerRemark}`}
                    {(orderStatus.status === "pending" ||
                      orderStatus.status === "processing") &&
                      "⏳ Delivering airtime…"}
                  </div>
                )}

                <a
                  href={`${explorerBase}${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View on explorer <ExternalLink className="h-3 w-3" />
                </a>
                <div className="flex gap-3 mt-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      reset();
                      setPhone("");
                      setAmount("");
                      setNotice(null);
                      setOrderId(null);
                      setOrderStatus(null);
                    }}
                  >
                    Buy Again
                  </Button>{" "}
                  <Button asChild className="flex-1">
                    <Link href="/">Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-lg">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          {notice && (
            <div
              className={`mb-4 flex items-start gap-2 rounded-md border p-3 text-sm ${
                notice.type === "error"
                  ? "border-destructive text-destructive bg-destructive/10"
                  : notice.type === "success"
                    ? "border-green-500 text-green-700 bg-green-50"
                    : "border-border bg-muted/50 text-foreground"
              }`}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {notice.msg}
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle>Buy Airtime</CardTitle>
              </div>
              <CardDescription>
                Top up any Nigerian number — payment is processed on-chain
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Network selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Network</label>
                <div className="grid grid-cols-4 gap-2">
                  {NETWORKS.map((n) => (
                    <button
                      key={n.code}
                      type="button"
                      onClick={() => setNetworkCode(n.code as NetworkCode)}
                      className={`rounded-lg border-2 py-2 text-xs font-semibold transition-all ${
                        networkCode === n.code
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-muted-foreground"
                      } ${n.color}`}
                    >
                      {n.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  className={inputClass}
                  type="tel"
                  placeholder="08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={11}
                  disabled={isBusy}
                />
                <p className="text-xs text-muted-foreground">
                  Nigerian number (11 digits)
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (₦)</label>
                <input
                  className={inputClass}
                  type="number"
                  placeholder="100"
                  min={50}
                  max={200000}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isBusy}
                />
                <p className="text-xs text-muted-foreground">
                  Min ₦50 · Max ₦200,000
                </p>
              </div>

              {/* Token selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pay with</label>
                <select
                  className={inputClass}
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  disabled={isBusy}
                >
                  {tokenSymbols.map((sym) => (
                    <option key={sym} value={sym}>
                      {sym}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Balance:{" "}
                  <span className="font-medium">
                    {displayBalance.toFixed(4)} {selectedToken}
                  </span>
                </p>
              </div>

              {/* Summary */}
              {amount && phone && (
                <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span className="font-medium">{selectedNetwork.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient</span>
                    <span className="font-medium">{phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Airtime value</span>
                    <span className="font-medium">₦{amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">You pay</span>
                    <span className="font-medium">
                      {rateLoading ? (
                        <span className="text-muted-foreground animate-pulse">
                          fetching rate…
                        </span>
                      ) : rateError ? (
                        <span className="text-destructive text-xs">
                          {rateError}
                        </span>
                      ) : tokenAmount ? (
                        `${tokenAmount} ${selectedToken}`
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                  {rate && coinId && !rateLoading && (
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                      1 {selectedToken} ≈ ₦{rate.toLocaleString()} · rate via
                      CoinGecko
                    </p>
                  )}
                </div>
              )}

              {!isConnected ? (
                <p className="text-center text-sm text-muted-foreground py-2">
                  Connect your wallet to continue
                </p>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isBusy}
                >
                  {isApproving
                    ? "Approving…"
                    : isPending
                      ? "Confirm in wallet…"
                      : isConfirming
                        ? "Processing…"
                        : "Buy Airtime"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
