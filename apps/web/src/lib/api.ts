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

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getNonce(
  address: string,
): Promise<{ nonce: string; message: string }> {
  return apiFetch(`/auth/nonce?address=${address}`);
}

export function verifySignature(payload: {
  address: string;
  signature: string;
  message: string;
  isMiniPay?: boolean;
}): Promise<{ token: string; user: UserProfile }> {
  return apiFetch("/auth/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyProfile(token: string): Promise<UserProfile> {
  return apiFetch("/users/me", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateProfile(
  token: string,
  data: Partial<{ email: string; phone: string; displayName: string }>,
): Promise<UserProfile> {
  return apiFetch("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export interface UserProfile {
  address: string;
  email?: string;
  phone?: string;
  displayName?: string;
  isMiniPay: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Privy Login ──────────────────────────────────────────────────────────────

export function privyLogin(payload: {
  accessToken: string;
}): Promise<{ token: string; user: UserProfile }> {
  return apiFetch("/auth/privy", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
