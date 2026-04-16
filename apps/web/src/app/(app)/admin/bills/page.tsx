"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { useAccount } from "wagmi";
import { type Address } from "viem";
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
  getBillBalances,
  type ChainBalances,
  type TokenBalance,
} from "@/lib/api";
import { useWithdrawBillFunds } from "@/hooks/useWithdrawBillFunds";

// ─── Admin wallet addresses allowed to use this page ─────────────────────────
// Add your deployer / admin wallet(s) here
const ADMIN_ADDRESSES: string[] = (
  process.env.NEXT_PUBLIC_ADMIN_ADDRESSES ?? ""
)
  .split(",")
  .map((a) => a.trim().toLowerCase())
  .filter(Boolean);

const NATIVE_ADDRESS = "0x0000000000000000000000000000000000000000";

export default function AdminBillsPage() {
  return (
    <ClientOnly>
      <AdminBillsContent />
    </ClientOnly>
  );
}

function AdminBillsContent() {
  const { address, isConnected, chain } = useAccount();

  const isAdmin =
    isConnected &&
    address &&
    (ADMIN_ADDRESSES.length === 0 ||
      ADMIN_ADDRESSES.includes(address.toLowerCase()));

  const [balances, setBalances] = useState<ChainBalances[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Withdraw form state
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [withdrawTo, setWithdrawTo] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [notice, setNotice] = useState<{
    type: "error" | "success" | "info";
    msg: string;
  } | null>(null);

  const { withdraw, hash, isPending, isConfirming, isConfirmed, error, reset } =
    useWithdrawBillFunds();

  // ─── Fetch balances ─────────────────────────────────────────────────────────

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBillBalances();
      setBalances(data);
      setLastFetched(new Date());
    } catch {
      setNotice({ type: "error", msg: "Failed to fetch balances" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchBalances();
  }, [isAdmin, fetchBalances]);

  useEffect(() => {
    if (error) setNotice({ type: "error", msg: error.message });
  }, [error]);

  useEffect(() => {
    if (isConfirmed) {
      setNotice({ type: "success", msg: "Withdrawal confirmed on-chain!" });
      setWithdrawAmount("");
      setWithdrawTo("");
      void fetchBalances();
    }
  }, [isConfirmed, fetchBalances]);

  // ─── Withdraw handler ───────────────────────────────────────────────────────

  const handleWithdraw = () => {
    setNotice(null);
    if (!selectedToken || !selectedChainId) {
      setNotice({ type: "error", msg: "Select a token first" });
      return;
    }
    if (!withdrawTo.match(/^0x[0-9a-fA-F]{40}$/)) {
      setNotice({ type: "error", msg: "Enter a valid recipient address" });
      return;
    }
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setNotice({ type: "error", msg: "Enter a valid amount" });
      return;
    }
    if (parseFloat(withdrawAmount) > parseFloat(selectedToken.formatted)) {
      setNotice({ type: "error", msg: "Amount exceeds available balance" });
      return;
    }
    if (chain?.id !== selectedChainId) {
      setNotice({
        type: "error",
        msg: `Switch your wallet to ${balances.find((b) => b.chainId === selectedChainId)?.chainName}`,
      });
      return;
    }

    try {
      withdraw(
        selectedToken.address as Address,
        withdrawTo as Address,
        withdrawAmount,
        selectedToken.decimals,
      );
    } catch (err: unknown) {
      setNotice({
        type: "error",
        msg: err instanceof Error ? err.message : "Transaction failed",
      });
    }
  };

  const explorerBase =
    chain?.id === 42220
      ? "https://celoscan.io/tx/"
      : "https://basescan.org/tx/";

  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

  const isBusy = isPending || isConfirming;

  // ─── Not connected / not admin ──────────────────────────────────────────────

  if (!isConnected) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center gap-4 text-center px-4">
        <Wallet className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Connect your wallet to access the admin panel
        </p>
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center gap-4 text-center px-4">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <p className="font-semibold text-lg">Access Denied</p>
        <p className="text-muted-foreground text-sm">
          This page is restricted to admin wallets.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  // ─── Admin UI ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBalances}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {notice && (
            <div
              className={`rounded-md border p-3 text-sm ${
                notice.type === "error"
                  ? "border-destructive text-destructive bg-destructive/10"
                  : notice.type === "success"
                    ? "border-green-500 text-green-700 bg-green-50"
                    : "border-border bg-muted/50 text-foreground"
              }`}
            >
              {notice.msg}
            </div>
          )}

          {/* ── Balances ── */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Fund Balances</CardTitle>
              <CardDescription>
                Funds locked in the contract from bill payments
                {lastFetched && (
                  <span className="ml-2 text-xs">
                    · updated {lastFetched.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && !balances.length ? (
                <p className="text-sm text-muted-foreground animate-pulse">
                  Loading balances…
                </p>
              ) : (
                balances.map((chain) => (
                  <div key={chain.chainId} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {chain.chainName}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {chain.contractAddress.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {chain.balances.map((token) => {
                        const isSelected =
                          selectedToken?.address === token.address &&
                          selectedChainId === chain.chainId;
                        const hasBalance = parseFloat(token.formatted) > 0;
                        return (
                          <button
                            key={token.symbol}
                            type="button"
                            onClick={() => {
                              setSelectedChainId(chain.chainId);
                              setSelectedToken(token);
                              setWithdrawAmount("");
                              reset();
                              setNotice(null);
                            }}
                            className={`rounded-lg border p-3 text-left transition-all ${
                              isSelected
                                ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                                : "border-border hover:border-muted-foreground"
                            } ${!hasBalance ? "opacity-50" : ""}`}
                          >
                            <p className="text-xs text-muted-foreground">
                              {token.symbol}
                            </p>
                            <p
                              className={`text-sm font-semibold mt-0.5 ${hasBalance ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {parseFloat(token.formatted).toFixed(
                                token.decimals === 6 ? 4 : 6,
                              )}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ── Withdraw form ── */}
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription>
                Select a token above, then enter recipient and amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedToken ? (
                <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-sm flex justify-between">
                  <span className="text-muted-foreground">Selected</span>
                  <span className="font-medium">
                    {selectedToken.symbol} on{" "}
                    {
                      balances.find((b) => b.chainId === selectedChainId)
                        ?.chainName
                    }
                    {" · "}available:{" "}
                    {parseFloat(selectedToken.formatted).toFixed(
                      selectedToken.decimals === 6 ? 4 : 6,
                    )}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click a token card above to select it
                </p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Address</label>
                <input
                  className={inputClass}
                  placeholder="0x..."
                  value={withdrawTo}
                  onChange={(e) => setWithdrawTo(e.target.value)}
                  disabled={isBusy}
                />
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => address && setWithdrawTo(address)}
                >
                  Use my address
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Amount {selectedToken ? `(${selectedToken.symbol})` : ""}
                </label>
                <div className="flex gap-2">
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="0.0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={isBusy || !selectedToken}
                    min="0"
                    step="any"
                  />
                  {selectedToken && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setWithdrawAmount(selectedToken.formatted)}
                      disabled={isBusy}
                    >
                      Max
                    </Button>
                  )}
                </div>
              </div>

              {isConfirmed && hash ? (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Withdrawn!{" "}
                  <a
                    href={`${explorerBase}${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    View tx <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleWithdraw}
                  disabled={isBusy || !selectedToken}
                >
                  {isPending
                    ? "Confirm in wallet…"
                    : isConfirming
                      ? "Processing…"
                      : `Withdraw ${selectedToken?.symbol ?? ""}`}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
