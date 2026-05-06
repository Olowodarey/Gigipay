/**
 * Gigipay Backend API client
 * All contract reads go through here instead of direct RPC calls.
 * Centralises error handling and base URL configuration.
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

/** Fetch a single voucher's on-chain details by ID. */
export function getVoucher(
  chainId: number,
  voucherId: string,
): Promise<VoucherDetail> {
  return apiFetch(`/vouchers?chainId=${chainId}&voucherId=${voucherId}`);
}

/** Fetch all voucher IDs that belong to a given voucher campaign name. */
export function getVouchersByName(
  chainId: number,
  voucherName: string,
): Promise<string[]> {
  return apiFetch(
    `/vouchers/by-name?chainId=${chainId}&voucherName=${encodeURIComponent(voucherName)}`,
  );
}

/** Fetch all voucher IDs created by a specific sender address. */
export function getSenderVouchers(
  chainId: number,
  sender: string,
): Promise<string[]> {
  return apiFetch(`/vouchers/by-sender?chainId=${chainId}&sender=${sender}`);
}

/** Returns true if the voucher exists, is not claimed, not refunded, and not expired. */
export function isVoucherClaimable(
  chainId: number,
  voucherId: string,
): Promise<boolean> {
  return apiFetch(
    `/vouchers/claimable?chainId=${chainId}&voucherId=${voucherId}`,
  );
}

/** Returns true if the voucher is expired or unclaimed and can be refunded by the sender. */
export function isVoucherRefundable(
  chainId: number,
  voucherId: string,
): Promise<boolean> {
  return apiFetch(
    `/vouchers/refundable?chainId=${chainId}&voucherId=${voucherId}`,
  );
}

/** Returns true if the Gigipay voucher contract is currently paused on the given chain. */
export function isContractPaused(chainId: number): Promise<boolean> {
  return apiFetch(`/vouchers/paused?chainId=${chainId}`);
}

// ─── Batch Transfer ───────────────────────────────────────────────────────────

/** Returns true if the batch transfer contract is currently paused on the given chain. */
export function isBatchContractPaused(chainId: number): Promise<boolean> {
  return apiFetch(`/batch-transfer/paused?chainId=${chainId}`);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Fetch a sign-in nonce for the given wallet address. Used in the SIWE flow. */
export function getNonce(
  address: string,
): Promise<{ nonce: string; message: string }> {
  return apiFetch(`/auth/nonce?address=${address}`);
}

/** Verify a wallet signature and receive a Gigipay JWT. */
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

/** Fetch the authenticated user's profile using a stored JWT. */
export function getMyProfile(token: string): Promise<UserProfile> {
  return apiFetch("/users/me", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

/** Update the authenticated user's profile fields (email, phone, displayName). */
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

// ─── Bills / Admin ────────────────────────────────────────────────────────────

export interface TokenBalance {
  symbol: string;
  address: string;
  raw: string;
  formatted: string;
  decimals: number;
}

export interface ChainBalances {
  chainId: number;
  chainName: string;
  contractAddress: string;
  balances: TokenBalance[];
}

export function getBillBalances(): Promise<ChainBalances[]> {
  return apiFetch("/bills/balances");
}

export function getBillBalancesByChain(
  chainId: number,
): Promise<ChainBalances> {
  return apiFetch(`/bills/balances/chain?chainId=${chainId}`);
}

// ─── Rates (CoinGecko via backend) ───────────────────────────────────────────

export interface TokenRate {
  coinId: string;
  ngn: number;
  usd: number;
  updatedAt: number;
}

export interface ConvertResult {
  tokenAmount: string;
  rate: number;
  coinId: string;
}

export function getAllRates(): Promise<Record<string, TokenRate>> {
  return apiFetch("/rates");
}

export function convertNgnToToken(
  chainId: number,
  amount: number,
): Promise<ConvertResult> {
  return apiFetch(`/rates/convert?chainId=${chainId}&amount=${amount}`);
}

// ─── Airtime ──────────────────────────────────────────────────────────────────

export interface AirtimeNetwork {
  networkCode: string;
  networkName: string;
  discountPercent: number;
}

export function getAirtimeNetworks(): Promise<AirtimeNetwork[]> {
  return apiFetch("/airtime/networks");
}

export function queryAirtimeTransaction(params: {
  orderId?: string;
  requestId?: string;
}): Promise<Record<string, string>> {
  const qs = params.orderId
    ? `orderId=${params.orderId}`
    : `requestId=${params.requestId}`;
  return apiFetch(`/airtime/query?${qs}`);
}

export interface AirtimeOrderStatus {
  id: string;
  status: "pending" | "processing" | "fulfilled" | "failed";
  providerOrderId: string | null;
  providerRemark: string | null;
  amountNgn: number;
  phoneNumber: string;
  networkCode: string;
}

export function registerAirtimeOrder(payload: {
  chainId: number;
  networkCode: string;
  phoneNumber: string;
  amountNgn: number;
  txHash: string;
  chainOrderId?: string;
}): Promise<AirtimeOrderStatus> {
  return apiFetch("/airtime/orders/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAirtimeOrderStatus(id: string): Promise<AirtimeOrderStatus> {
  return apiFetch(`/airtime/orders/${id}`);
}

// ─── Privy Login ──────────────────────────────────────────────────────────────

/**
 * Exchange a Privy access token for a Gigipay JWT.
 * Called automatically after Privy authentication succeeds.
 */
export function privyLogin(payload: {
  accessToken: string;
}): Promise<{ token: string; user: UserProfile }> {
  return apiFetch("/auth/privy", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
