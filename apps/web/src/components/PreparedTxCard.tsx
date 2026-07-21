"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, CheckCircle2, ExternalLink } from "lucide-react";
import {
  useAccount,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi, formatUnits, type Address } from "viem";
import { Button } from "@/components/ui/button";
import { getContractAddress } from "@/lib/contracts";
import { withAttribution, getAttributionSuffix } from "@/lib/attribution";
import { registerAirtimeOrder, type AgentPreparedTx } from "@/lib/api";

/**
 * Renders one agent/scheduler-prepared transaction as an approve → sign → fulfil
 * card. The user signs everything in their own wallet — the app never holds keys.
 *
 * `onSigned` fires once when the tx hash first appears (user signed), so callers
 * (e.g. /schedules) can record the run as signed on the backend.
 */
export function PreparedTxCard({
  tx,
  onSigned,
}: {
  tx: AgentPreparedTx;
  onSigned?: (txHash: string) => void;
}) {
  const spender = useMemo<Address | undefined>(() => {
    try {
      return getContractAddress(tx.chainId);
    } catch {
      return undefined;
    }
  }, [tx.chainId]);

  // The run/agent tx is prepared for a specific chain (tx.chainId). If the wallet
  // is on a different network, the approval + payment would hit the wrong chain's
  // contract/token — so we switch first and pin every write to tx.chainId.
  const { chainId: walletChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [switching, setSwitching] = useState(false);
  const [chainError, setChainError] = useState<string | null>(null);
  const wrongChain = walletChainId != null && walletChainId !== tx.chainId;

  const {
    writeContract: approve,
    data: approvalHash,
    isPending: approvePending,
    error: approveError,
  } = useWriteContract();
  const { isSuccess: approvalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash,
    chainId: tx.chainId,
  });

  const {
    sendTransaction,
    data: txHash,
    isPending: sendPending,
    error: sendError,
  } = useSendTransaction();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: tx.chainId,
  });

  const [approvalStarted, setApprovalStarted] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [notifiedSigned, setNotifiedSigned] = useState(false);

  const doSend = () =>
    sendTransaction({
      chainId: tx.chainId,
      to: tx.to,
      // Append the Celo attribution suffix (ERC-8021) — invisible to the
      // contract, used only for ecosystem impact tracking.
      data: withAttribution(tx.data, tx.chainId),
      value: BigInt(tx.value || "0"),
    });

  const onSign = async () => {
    setChainError(null);
    // Make sure the wallet is on the chain this payment was prepared for.
    if (wrongChain) {
      try {
        setSwitching(true);
        await switchChainAsync({ chainId: tx.chainId });
      } catch {
        setChainError(
          `Please switch your wallet to the correct network to pay.`,
        );
        return;
      } finally {
        setSwitching(false);
      }
    }
    if (tx.requiresApproval && spender) {
      setApprovalStarted(true);
      approve({
        chainId: tx.chainId,
        address: tx.token.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [spender, BigInt(tx.amount)],
        dataSuffix: getAttributionSuffix(tx.chainId),
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

  // Notify the caller as soon as the user has signed (tx hash exists).
  useEffect(() => {
    if (txHash && !notifiedSigned) {
      setNotifiedSigned(true);
      onSigned?.(txHash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHash]);

  // After the payment confirms, fulfil any post-action (e.g. deliver airtime).
  useEffect(() => {
    if (!txConfirmed || !txHash) return;
    if (tx.postAction?.type === "registerAirtimeOrder" && !registered) {
      setRegistered(true);
      registerAirtimeOrder({ ...tx.postAction.payload, txHash }).catch((err) =>
        console.error("registerAirtimeOrder failed:", err),
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

  const busy = approvePending || sendPending || switching;
  const chainName =
    tx.chainId === 42220
      ? "Celo"
      : tx.chainId === 8453
        ? "Base"
        : tx.chainId === 11142220
          ? "Celo Sepolia"
          : `chain ${tx.chainId}`;
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
          {switching
            ? `Switch to ${chainName}…`
            : approvePending
              ? "Approve in wallet…"
              : sendPending
                ? "Confirm in wallet…"
                : txHash
                  ? "Processing…"
                  : wrongChain
                    ? `Switch to ${chainName} & pay`
                    : tx.requiresApproval
                      ? "Approve & Sign"
                      : "Sign payment"}
        </Button>
      )}

      {(chainError || approveError || sendError) && (
        <p className="text-xs text-destructive">
          {chainError || (approveError || sendError)?.message?.slice(0, 140)}
        </p>
      )}
    </div>
  );
}
