"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi, formatUnits, type Address } from "viem";
import { ClientOnly } from "@/components/batch-payment/ClientOnly";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getContractAddress } from "@/lib/contracts";
import {
  sendAgentMessage,
  registerAirtimeOrder,
  type AgentMessage,
  type AgentPreparedTx,
} from "@/lib/api";

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function AgentPage() {
  return (
    <ClientOnly>
      <AgentContent />
    </ClientOnly>
  );
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

function AgentContent() {
  const { address, chain } = useAccount();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [transactions, setTransactions] = useState<AgentPreparedTx[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transactions, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await sendAgentMessage({
        messages: next,
        chainId: chain?.id,
        userAddress: address,
      });
      setMessages([...next, { role: "assistant", content: res.reply }]);
      if (res.transactions.length) {
        setTransactions((prev) => [...prev, ...res.transactions]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Send ₦500 MTN airtime to 08012345678 with USDC",
    "Pay my team: 5 USDC each to two wallets",
    "How much is ₦2000 airtime in USDT?",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> You sign every payment
            </span>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>GigiPay Agent</CardTitle>
              </div>
              <CardDescription>
                Ask in plain language — pay airtime, run payroll, get quotes. The
                agent prepares each payment; you approve and sign it in your
                wallet.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Conversation */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {messages.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Try one of these:
                    </p>
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setInput(s)}
                        className="block w-full text-left text-sm rounded-md border border-border bg-muted/40 px-3 py-2 hover:border-primary transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground inline-flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…
                    </div>
                  </div>
                )}

                {/* Prepared transactions */}
                {transactions.map((tx) => (
                  <TransactionCard key={tx.id} tx={tx} />
                ))}

                <div ref={endRef} />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Composer */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Message the GigiPay Agent…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  disabled={loading}
                />
                <Button onClick={send} disabled={loading || !input.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Transaction card (approve → sign → fulfil) ────────────────────────────────

function TransactionCard({ tx }: { tx: AgentPreparedTx }) {
  const spender = useMemo<Address | undefined>(() => {
    try {
      return getContractAddress(tx.chainId);
    } catch {
      return undefined;
    }
  }, [tx.chainId]);

  const {
    writeContract: approve,
    data: approvalHash,
    isPending: approvePending,
    error: approveError,
  } = useWriteContract();
  const { isSuccess: approvalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  const {
    sendTransaction,
    data: txHash,
    isPending: sendPending,
    error: sendError,
  } = useSendTransaction();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const [approvalStarted, setApprovalStarted] = useState(false);
  const [registered, setRegistered] = useState(false);

  const doSend = () =>
    sendTransaction({
      to: tx.to,
      data: tx.data,
      value: BigInt(tx.value || "0"),
    });

  const onSign = () => {
    if (tx.requiresApproval && spender) {
      setApprovalStarted(true);
      approve({
        address: tx.token.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, BigInt(tx.amount)],
      });
    } else {
      doSend();
    }
  };

  // Auto-send once the ERC-20 approval confirms.
  useEffect(() => {
    if (approvalConfirmed && approvalStarted && !txHash) doSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalConfirmed]);

  // After the payment confirms, fulfil any post-action (e.g. deliver airtime).
  useEffect(() => {
    if (!txConfirmed || !txHash) return;
    if (tx.postAction?.type === "registerAirtimeOrder" && !registered) {
      setRegistered(true);
      registerAirtimeOrder({ ...tx.postAction.payload, txHash }).catch(
        (err) => console.error("registerAirtimeOrder failed:", err),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txConfirmed, txHash]);

  const explorerBase =
    tx.chainId === 42220
      ? "https://celoscan.io/tx/"
      : tx.chainId === 8453
        ? "https://basescan.org/tx/"
        : "https://celo-sepolia.blockscout.com/tx/";

  const busy = approvePending || sendPending;
  const humanAmount = (() => {
    try {
      return formatUnits(BigInt(tx.amount), tx.token.decimals);
    } catch {
      return tx.amount;
    }
  })();

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium">{tx.summary}</p>
          <p className="text-xs text-muted-foreground">
            {humanAmount} {tx.token.symbol}
            {tx.requiresApproval ? " · approval + payment" : ""}
          </p>
        </div>
      </div>

      {txConfirmed ? (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Payment confirmed
          {txHash && (
            <a
              href={`${explorerBase}${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              view <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      ) : (
        <Button
          size="sm"
          className="w-full"
          onClick={onSign}
          disabled={busy || !!txHash}
        >
          {approvePending
            ? "Approve in wallet…"
            : sendPending
              ? "Confirm in wallet…"
              : txHash
                ? "Processing…"
                : tx.requiresApproval
                  ? "Approve & Sign"
                  : "Sign payment"}
        </Button>
      )}

      {(approveError || sendError) && (
        <p className="text-xs text-destructive">
          {(approveError || sendError)?.message?.slice(0, 140)}
        </p>
      )}
    </div>
  );
}
