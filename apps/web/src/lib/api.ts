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

/**
 * MiniPay login — issues a JWT bound to the injected wallet address WITHOUT a
 * signature. MiniPay does not support `personal_sign`, so the SIWE flow can't
 * run there; Gigipay is non-custodial so this only scopes per-user data.
 */
export function miniPayLogin(
  address: string,
): Promise<{ token: string; user: UserProfile }> {
  return apiFetch("/auth/minipay", {
    method: "POST",
    body: JSON.stringify({ address }),
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

/** Fetch the list of supported Nigerian airtime networks and their discount rates. */
export function getAirtimeNetworks(): Promise<AirtimeNetwork[]> {
  return apiFetch("/airtime/networks");
}

/** Query an airtime transaction status by orderId or requestId. */
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

/**
 * Register an on-chain airtime payment with the backend so it can
 * fulfil the airtime delivery via ClubKonnect.
 */
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

/** Poll the delivery status of a registered airtime order by its backend ID. */
export function getAirtimeOrderStatus(id: string): Promise<AirtimeOrderStatus> {
  return apiFetch(`/airtime/orders/${id}`);
}

// ─── GigiPay Agent ──────────────────────────────────────────────────────────────

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

/** A transaction the agent prepared for the user to review and sign. */
export interface AgentPreparedTx {
  id: string;
  kind: "airtime" | "batch-transfer";
  summary: string;
  chainId: number;
  to: `0x${string}`;
  data: `0x${string}`;
  value: string; // native value in wei (string)
  token: {
    symbol: string;
    address: `0x${string}`;
    decimals: number;
    isNative: boolean;
  };
  amount: string; // token amount in base units (for ERC-20 approval)
  requiresApproval: boolean;
  postAction?: {
    type: "registerAirtimeOrder";
    payload: {
      chainId: number;
      networkCode: string;
      phoneNumber: string;
      amountNgn: number;
    };
  };
}

/** A recurring schedule the agent proposed for the user to confirm & save. */
export interface AgentPreparedSchedule {
  id: string;
  summary: string;
  payload: CreateSchedulePayload;
}

/**
 * A read-only directive the agent asks the frontend to fulfil with the
 * signed-in user's JWT (the /agent endpoint is unauthenticated, so it can't read
 * the user's data itself).
 */
export type AgentAction =
  | { type: "list_schedules" }
  | { type: "list_due" }
  | { type: "recent_activity"; limit: number }
  | { type: "navigate"; href: string; label: string };

export interface AgentChatResult {
  reply: string;
  transactions: AgentPreparedTx[];
  schedules: AgentPreparedSchedule[];
  actions: AgentAction[];
}

/** Send the full conversation to the GigiPay Agent and get a reply + prepared txs. */
export function sendAgentMessage(payload: {
  messages: AgentMessage[];
  chainId?: number;
  userAddress?: string;
}): Promise<AgentChatResult> {
  return apiFetch("/agent/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Scheduled / Recurring Payments ───────────────────────────────────────────

/** Authenticated fetch — attaches the Gigipay JWT. */
function authFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  return apiFetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });
}

export type ScheduleKind = "airtime" | "batch-transfer";
export type ScheduleCadence = "daily" | "weekly" | "monthly";
export type ScheduleStatus = "active" | "paused" | "cancelled" | "completed";

export interface Schedule {
  id: string;
  ownerAddress: string;
  chainId: number;
  kind: ScheduleKind;
  tokenSymbol: string;
  params:
    | { phoneNumber: string; amountNgn: number; network: string }
    | { recipients: { address: string; amount: string }[] };
  cadence: ScheduleCadence;
  nextRunAt: string;
  endAt: string | null;
  status: ScheduleStatus;
  spendCapUsd: string | null;
  label: string | null;
  cyclesCreated: number;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleRunStatus =
  | "pending"
  | "signed"
  | "fulfilled"
  | "failed"
  | "skipped";

export interface ScheduleRun {
  id: string;
  scheduleId: string;
  cycle: number;
  dueAt: string;
  status: ScheduleRunStatus;
  txHash: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  schedule: Schedule | null;
}

export interface CreateSchedulePayload {
  kind: ScheduleKind;
  chainId?: number;
  tokenSymbol: string;
  cadence: ScheduleCadence;
  startAt?: string;
  endAt?: string;
  spendCapUsd?: number;
  label?: string;
  // airtime
  phoneNumber?: string;
  amountNgn?: number;
  network?: string;
  // batch-transfer
  recipients?: { address: string; amount: string }[];
}

export function createSchedule(
  token: string,
  payload: CreateSchedulePayload,
): Promise<Schedule> {
  return authFetch("/schedules", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listSchedules(token: string): Promise<Schedule[]> {
  return authFetch("/schedules", token);
}

export function listScheduleRuns(token: string): Promise<ScheduleRun[]> {
  return authFetch("/schedules/runs", token);
}

/** Build the signable calldata for a due run (rendered with PreparedTxCard). */
export function prepareScheduleRun(
  token: string,
  runId: string,
): Promise<AgentPreparedTx> {
  return authFetch(`/schedules/runs/${runId}/prepare`, token, {
    method: "POST",
  });
}

export function markScheduleRunSigned(
  token: string,
  runId: string,
  txHash: string,
): Promise<ScheduleRun> {
  return authFetch(`/schedules/runs/${runId}/signed`, token, {
    method: "POST",
    body: JSON.stringify({ txHash }),
  });
}

export function pauseSchedule(token: string, id: string): Promise<Schedule> {
  return authFetch(`/schedules/${id}/pause`, token, { method: "PATCH" });
}

export function resumeSchedule(token: string, id: string): Promise<Schedule> {
  return authFetch(`/schedules/${id}/resume`, token, { method: "PATCH" });
}

export function cancelSchedule(token: string, id: string): Promise<Schedule> {
  return authFetch(`/schedules/${id}/cancel`, token, { method: "PATCH" });
}

// ─── Web Push notifications ────────────────────────────────────────────────────

/** Public VAPID key (falls back to backend if the env var is unset). */
export function getVapidPublicKey(): Promise<{ publicKey: string }> {
  return apiFetch("/notifications/vapid-public-key");
}

/** Register a browser push subscription for the authenticated user. */
export function subscribePush(
  token: string,
  subscription: PushSubscriptionJSON,
): Promise<{ ok: true }> {
  return authFetch("/notifications/subscribe", token, {
    method: "POST",
    body: JSON.stringify(subscription),
  });
}

/** Remove a browser push subscription. */
export function unsubscribePush(
  token: string,
  endpoint: string,
): Promise<{ ok: true }> {
  return authFetch("/notifications/unsubscribe", token, {
    method: "POST",
    body: JSON.stringify({ endpoint }),
  });
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

// ─── Public metrics (stats page) ───────────────────────────────────────────────

export interface GigipayMetrics {
  generatedAt: string;
  users: { total: number; miniPay: number; new7d: number; new30d: number };
  airtime: {
    total: number;
    fulfilled: number;
    failed: number;
    pending: number;
    failedRatePct: number;
    volumeNgnFulfilled: number;
    byNetwork: Record<"MTN" | "GLO" | "9MOBILE" | "AIRTEL", number>;
    last7d: number;
    last30d: number;
  };
  schedules: {
    total: number;
    active: number;
    byKind: Record<"airtime" | "batch-transfer", number>;
  };
  runs: {
    total: number;
    signed: number;
    fulfilled: number;
    pending: number;
    failed: number;
    completed: number;
    failedRatePct: number;
  };
  activity: { activeWallets7d: number; activeWallets30d: number };
  engagement: { dau: number; mau: number; stickinessPct: number } | null;
  daily: Array<{ date: string; airtime: number; runs: number }>;
}

/** Public aggregate stats — no auth, no per-user data. */
export function getMetrics(): Promise<GigipayMetrics> {
  return apiFetch("/metrics");
}
