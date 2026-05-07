"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  Download,
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
import {
  registerAirtimeOrder,
  getAirtimeOrderStatus,
  type AirtimeOrderStatus,
} from "@/lib/api";

// ─── Token config ─────────────────────────────────────────────────────────────

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

const TOKEN_DECIMALS: Record<string, number> = { USDC: 6, USDbC: 6, USDT: 6 };
const getDecimals = (sym: string) => TOKEN_DECIMALS[sym] ?? 18;

// ─── Types ────────────────────────────────────────────────────────────────────

type RecipientStatus = "pending" | "processing" | "done" | "failed";

interface Recipient {
  id: string;
  phone: string;
  networkCode: NetworkCode;
  amountNgn: string;
  status: RecipientStatus;
  txHash?: string;
  orderId?: string;
  orderStatus?: AirtimeOrderStatus;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);
const isValidPhone = (p: string) => /^0[7-9][01]\d{8}$/.test(p.trim());

function emptyRecipient(): Recipient {
  return {
    id: uid(),
    phone: "",
    networkCode: "01",
    amountNgn: "",
    status: "pending",
  };
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function BulkAirtimePage() {
  return (
    <ClientOnly>
      <BulkAirtimeContent />
    </ClientOnly>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function BulkAirtimeContent() {
  const { address, isConnected, chain } = useAccount();
  const { data: nativeBalance } = useBalance({ address });

  const tokens = chain?.id ? (TOKEN_ADDRESSES[chain.id] ?? {}) : {};
  const tokenSymbols = Object.keys(tokens);
  const defaultToken = tokenSymbols[0] ?? "CELO";

  const [selectedToken, setSelectedToken] = useState(defaultToken);
  const [recipients, setRecipients] = useState<Recipient[]>([emptyRecipient()]);
  const [isSending, setIsSending] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState<{
    type: "error" | "success" | "info";
    msg: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // payBill hook — reused per recipient
  const {
    payAirtime,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: txError,
    reset: resetTx,
  } = usePayBillAirtime();

  // Rate for the first pending recipient's amount (used for total estimate)
  const firstPendingAmount =
    recipients.find((r) => r.status === "pending")?.amountNgn ?? "";
  const { tokenAmount: sampleTokenAmount, rate } = useRate(
    chain?.id,
    firstPendingAmount,
  );

  // ─── Recipient management ─────────────────────────────────────────────────

  const addRow = () => setRecipients((prev) => [...prev, emptyRecipient()]);

  const removeRow = (id: string) =>
    setRecipients((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (id: string, patch: Partial<Recipient>) =>
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );

  // ─── CSV upload ───────────────────────────────────────────────────────────

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const parsed: Recipient[] = [];
      for (const line of lines) {
        // Skip header row
        if (line.toLowerCase().startsWith("phone")) continue;
        const [phone, network, amount] = line.split(",").map((s) => s.trim());
        if (!phone) continue;
        const networkCode = (NETWORKS.find(
          (n) =>
            n.name.toLowerCase() === (network ?? "").toLowerCase() ||
            n.code === network,
        )?.code ?? "01") as NetworkCode;
        parsed.push({
          id: uid(),
          phone: phone ?? "",
          networkCode,
          amountNgn: amount ?? "",
          status: "pending",
        });
      }
      if (parsed.length) setRecipients(parsed);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const csv =
      "phone,network,amount_ngn\n08012345678,MTN,100\n07098765432,Airtel,200";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-airtime-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Validation ───────────────────────────────────────────────────────────

  const validate = () => {
    if (!isConnected) {
      setNotice({ type: "error", msg: "Connect your wallet first" });
      return false;
    }
    for (const r of recipients) {
      if (!isValidPhone(r.phone)) {
        setNotice({
          type: "error",
          msg: `Invalid phone: ${r.phone || "(empty)"}`,
        });
        return false;
      }
      const amt = parseFloat(r.amountNgn);
      if (!r.amountNgn || isNaN(amt) || amt < 50) {
        setNotice({
          type: "error",
          msg: `Amount must be ≥ ₦50 for ${r.phone}`,
        });
        return false;
      }
      if (amt > 200000) {
        setNotice({
          type: "error",
          msg: `Amount must be ≤ ₦200,000 for ${r.phone}`,
        });
        return false;
      }
    }
    return true;
  };

  // ─── Sequential send ──────────────────────────────────────────────────────

  // We track which recipient is currently being processed via currentIndex.
  // When a tx confirms, we register the order and move to the next recipient.

  const sendAll = async () => {
    if (!validate()) return;
    setNotice(null);
    setIsSending(true);
    // Reset all to pending
    setRecipients((prev) => prev.map((r) => ({ ...r, status: "pending" })));
    setCurrentIndex(0);
  };

  // Watch for tx confirmation to advance the queue
  useEffect(() => {
    if (currentIndex === null || !isSending) return;
    if (currentIndex >= recipients.length) {
      setIsSending(false);
      setCurrentIndex(null);
      setNotice({ type: "success", msg: "All airtime sent successfully!" });
      return;
    }

    const recipient = recipients[currentIndex];
    if (recipient.status !== "pending") return;

    // Mark as processing
    updateRow(recipient.id, { status: "processing" });

    // We need the rate for this specific amount
    // We'll use the rate hook indirectly — fire the tx with the amount
    // The rate is fetched per-recipient in the send loop
    sendRecipient(recipient);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isSending]);

  // When tx confirms, register order and advance
  useEffect(() => {
    if (!isConfirmed || !hash || currentIndex === null) return;
    const recipient = recipients[currentIndex];
    if (!recipient) return;

    updateRow(recipient.id, { status: "done", txHash: hash });

    // Register with backend (non-fatal)
    if (chain?.id) {
      registerAirtimeOrder({
        chainId: chain.id,
        networkCode: recipient.networkCode,
        phoneNumber: recipient.phone.trim(),
        amountNgn: parseFloat(recipient.amountNgn),
        txHash: hash,
      })
        .then((order) => {
          updateRow(recipient.id, { orderId: order.id, orderStatus: order });
          pollOrder(recipient.id, order.id);
        })
        .catch(console.error);
    }

    resetTx();
    setCurrentIndex((prev) => (prev !== null ? prev + 1 : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, hash]);

  // Handle tx error
  useEffect(() => {
    if (!txError || currentIndex === null) return;
    const recipient = recipients[currentIndex];
    if (!recipient) return;
    updateRow(recipient.id, {
      status: "failed",
      error: txError.message ?? "Transaction failed",
    });
    resetTx();
    // Skip to next
    setCurrentIndex((prev) => (prev !== null ? prev + 1 : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txError]);

  const sendRecipient = async (recipient: Recipient) => {
    try {
      // We need the token amount for this recipient's NGN amount
      // Fetch rate inline
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/rates/convert?chainId=${chain?.id}&amount=${recipient.amountNgn}`,
      );
      if (!res.ok) throw new Error("Failed to fetch rate");
      const { tokenAmount } = await res.json();

      // ERC20 approval check
      if (!isNative) {
        const required = parseUnits(tokenAmount, decimals);
        const { data: fresh } = await refetchAllowance();
        const current = fresh ?? allowance;
        if (current < required) {
          setNotice({
            type: "info",
            msg: "Approving token spend — confirm in your wallet",
          });
          approve(tokenAmount, decimals);
          return;
        }
      }

      payAirtime(
        tokenAddress,
        tokenAmount,
        decimals,
        recipient.networkCode,
        recipient.phone.trim(),
      );
    } catch (err: any) {
      updateRow(recipient.id, {
        status: "failed",
        error: err.message ?? "Failed",
      });
      setCurrentIndex((prev) => (prev !== null ? prev + 1 : null));
    }
  };

  const pollOrder = (recipientId: string, orderId: string) => {
    const interval = setInterval(async () => {
      try {
        const updated = await getAirtimeOrderStatus(orderId);
        updateRow(recipientId, { orderStatus: updated });
        if (updated.status === "fulfilled" || updated.status === "failed") {
          clearInterval(interval);
        }
      } catch {
        // ignore
      }
    }, 2000);
  };

  // After approval confirmed, retry current recipient
  useEffect(() => {
    if (!approvalConfirmed || currentIndex === null) return;
    const recipient = recipients[currentIndex];
    if (recipient) sendRecipient(recipient);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalConfirmed]);

  // ─── Derived stats ────────────────────────────────────────────────────────

  const totalNgn = recipients.reduce(
    (sum, r) => sum + (parseFloat(r.amountNgn) || 0),
    0,
  );
  const doneCount = recipients.filter((r) => r.status === "done").length;
  const failedCount = recipients.filter((r) => r.status === "failed").length;
  const explorerBase =
    chain?.id === 42220
      ? "https://celoscan.io/tx/"
      : "https://basescan.org/tx/";

  const inputClass =
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

  const allDone =
    doneCount + failedCount === recipients.length &&
    isSending === false &&
    doneCount > 0;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <Link
            href="/buy-airtime"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Buy Airtime
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <CardTitle>Bulk Airtime</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Template
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload CSV
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSV}
                  />
                </div>
              </div>
              <CardDescription>
                Send airtime to multiple Nigerian numbers in one session.
                Transactions are processed one at a time.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Token selector */}
              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium">Pay with</label>
                  <select
                    className={inputClass}
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    disabled={isSending}
                  >
                    {tokenSymbols.map((sym) => (
                      <option key={sym} value={sym}>
                        {sym}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-muted-foreground pt-5">
                  Balance:{" "}
                  <span className="font-medium text-foreground">
                    {displayBalance.toFixed(4)} {selectedToken}
                  </span>
                </div>
              </div>

              {/* Recipients table */}
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_120px_100px_36px] gap-2 px-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    Phone
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Network
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Amount (₦)
                  </span>
                  <span />
                </div>

                {recipients.map((r, i) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[1fr_120px_100px_36px] gap-2 items-center"
                  >
                    <input
                      className={inputClass}
                      type="tel"
                      placeholder="08012345678"
                      value={r.phone}
                      onChange={(e) =>
                        updateRow(r.id, { phone: e.target.value })
                      }
                      disabled={isSending || r.status !== "pending"}
                      maxLength={11}
                    />
                    <select
                      className={inputClass}
                      value={r.networkCode}
                      onChange={(e) =>
                        updateRow(r.id, {
                          networkCode: e.target.value as NetworkCode,
                        })
                      }
                      disabled={isSending || r.status !== "pending"}
                    >
                      {NETWORKS.map((n) => (
                        <option key={n.code} value={n.code}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className={inputClass}
                      type="number"
                      placeholder="100"
                      min={50}
                      max={200000}
                      value={r.amountNgn}
                      onChange={(e) =>
                        updateRow(r.id, { amountNgn: e.target.value })
                      }
                      disabled={isSending || r.status !== "pending"}
                    />
                    {/* Status indicator or delete */}
                    <div className="flex items-center justify-center">
                      {r.status === "pending" && !isSending && (
                        <button
                          onClick={() => removeRow(r.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          disabled={recipients.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      {r.status === "processing" && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {r.status === "done" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {r.status === "failed" && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>

                    {/* Tx hash / error row */}
                    {(r.txHash || r.error) && (
                      <div className="col-span-4 pl-1 -mt-1">
                        {r.txHash && (
                          <a
                            href={`${explorerBase}${r.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            View tx <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {r.orderStatus?.status === "fulfilled" && (
                          <span className="ml-2 text-xs text-green-600">
                            ✅ Delivered
                          </span>
                        )}
                        {r.orderStatus?.status === "failed" && (
                          <span className="ml-2 text-xs text-destructive">
                            ❌ {r.orderStatus.providerRemark}
                          </span>
                        )}
                        {r.error && (
                          <span className="text-xs text-destructive">
                            {r.error}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add row */}
              {!isSending && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add recipient
                </Button>
              )}

              {/* Summary */}
              {recipients.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipients</span>
                    <span className="font-medium">{recipients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total airtime</span>
                    <span className="font-medium">
                      ₦{totalNgn.toLocaleString()}
                    </span>
                  </div>
                  {isSending && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {doneCount + failedCount} / {recipients.length}
                        {failedCount > 0 && (
                          <span className="text-destructive ml-1">
                            ({failedCount} failed)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {rate && (
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                      Rate: 1 {selectedToken} ≈ ₦{rate.toLocaleString()} · via
                      CoinGecko
                    </p>
                  )}
                </div>
              )}

              {!isConnected ? (
                <p className="text-center text-sm text-muted-foreground py-2">
                  Connect your wallet to continue
                </p>
              ) : allDone ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setRecipients([emptyRecipient()]);
                      setNotice(null);
                    }}
                  >
                    Send More
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/">Home</Link>
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={sendAll}
                  disabled={isSending || isApproving}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving…
                    </>
                  ) : isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending {currentIndex !== null ? currentIndex + 1 : ""}/
                      {recipients.length}…
                    </>
                  ) : (
                    `Send Airtime to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}`
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
