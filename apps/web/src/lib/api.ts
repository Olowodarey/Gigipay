/**
 * Gigipay Backend API client
 * All contract reads go through here instead of direct RPC calls
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `API error ${res.status}`);
  }
  return res.json();
}

// ─── Voucher Reads ────────────────────────────────────────────────────────────

export interface VoucherDetail {
  sender: string;
  token: string;
  amount: string;
  claimCodeHash: string;
  expiresAt: string;
  claimed: boolean;
  refunded: boolean;
  voucherName: string;
}

export function getVoucher(
  chainId: number,
  voucherId: string,
): Promise<VoucherDetail> {
  return apiFetch(`/vouchers?chainId=${chainId}&voucherId=${voucherId}`);
}

export function getVouchersByName(
  chainId: number,
  voucherName: string,
): Promise<string[]> {
  return apiFetch(
    `/vouchers/by-name?chainId=${chainId}&voucherName=${encodeURIComponent(voucherName)}`,
  );
}

export function getSenderVouchers(
  chainId: number,
  sender: string,
): Promise<string[]> {
  return apiFetch(`/vouchers/by-sender?chainId=${chainId}&sender=${sender}`);
}

export function isVoucherClaimable(
  chainId: number,
  voucherId: string,
): Promise<boolean> {
  return apiFetch(
    `/vouchers/claimable?chainId=${chainId}&voucherId=${voucherId}`,
  );
}

export function isVoucherRefundable(
  chainId: number,
  voucherId: string,
): Promise<boolean> {
  return apiFetch(
    `/vouchers/refundable?chainId=${chainId}&voucherId=${voucherId}`,
  );
}

export function isContractPaused(chainId: number): Promise<boolean> {
  return apiFetch(`/vouchers/paused?chainId=${chainId}`);
}

// ─── Batch Transfer ───────────────────────────────────────────────────────────

export function isBatchContractPaused(chainId: number): Promise<boolean> {
  return apiFetch(`/batch-transfer/paused?chainId=${chainId}`);
}
