"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  Loader2,
  Pause,
  Play,
  X,
  ShieldCheck,
  Plus,
  Bell,
  BellRing,
} from "lucide-react";
import { ClientOnly } from "@/components/batch-payment/ClientOnly";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WalletConnectButton } from "@/components/connect-button";
import { PreparedTxCard } from "@/components/PreparedTxCard";
import { useAuth } from "@/hooks/useAuth";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useIsMiniPay } from "@/hooks/useIsMiniPay";
import { filterTokensForEnv } from "@/lib/minipay";
import { useAccount } from "wagmi";
import {
  createSchedule,
  listSchedules,
  listScheduleRuns,
  prepareScheduleRun,
  markScheduleRunSigned,
  pauseSchedule,
  resumeSchedule,
  cancelSchedule,
  type Schedule,
  type ScheduleRun,
  type ScheduleCadence,
  type ScheduleKind,
  type CreateSchedulePayload,
  type AgentPreparedTx,
} from "@/lib/api";

const TOKENS = ["USDC", "USDT", "USDm", "CELO"];
const NETWORKS = ["MTN", "GLO", "AIRTEL", "9MOBILE"];
const CADENCES: ScheduleCadence[] = ["daily", "weekly", "monthly"];

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function SchedulesPage() {
  return (
    <ClientOnly>
      <SchedulesContent />
    </ClientOnly>
  );
}

function SchedulesContent() {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  // While wagmi restores a persisted connection, it briefly reports
  // isConnected=false — don't flash the "Connect wallet" card during that.
  const walletSettling = isConnecting || isReconnecting;
  const { token, isAuthenticating, signIn, error: authError } = useAuth();

  // Auto-start the one-time SIWE sign-in when a wallet is connected but there's
  // no stored session yet. Guarded so a rejected signature doesn't loop.
  const autoTried = useRef(false);
  useEffect(() => {
    if (!isConnected) {
      autoTried.current = false;
      return;
    }
    if (!token && !autoTried.current) {
      autoTried.current = true;
      signIn();
    }
  }, [isConnected, token, signIn]);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [runs, setRuns] = useState<ScheduleRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [s, r] = await Promise.all([
        listSchedules(token),
        listScheduleRuns(token),
      ]);
      setSchedules(s);
      setRuns(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load as soon as we have a session token — viewing schedules only needs the
  // JWT (which persists ~7 days), not a live wallet connection. The wallet is
  // only required to *sign* a due payment (handled by PreparedTxCard).
  useEffect(() => {
    if (token) reload();
  }, [token, reload]);

  const pendingRuns = runs.filter((r) => r.status === "pending");

  return (
    <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
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

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" /> Recurring payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set up airtime or payroll to repeat automatically. When each one is
            due, you get a card here to approve and sign — never a silent spend.
          </p>
        </div>

        {!token ? (
          walletSettling ? (
            <Card>
              <CardContent className="py-8">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Reconnecting your
                  wallet…
                </div>
              </CardContent>
            </Card>
          ) : !isConnected ? (
            <Card>
              <CardHeader>
                <CardTitle>Connect your wallet</CardTitle>
                <CardDescription>
                  Connect a wallet to set up and confirm recurring payments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletConnectButton />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isAuthenticating ? "Signing you in…" : "One-time sign-in"}
                </CardTitle>
                <CardDescription>
                  A quick signature (no fee) so only you can see and confirm your
                  recurring payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {isAuthenticating ? (
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Check your wallet
                    to approve the sign-in…
                  </div>
                ) : (
                  <>
                    {authError && (
                      <p className="text-sm text-destructive">{authError}</p>
                    )}
                    <Button onClick={signIn}>Sign in</Button>
                  </>
                )}
              </CardContent>
            </Card>
          )
        ) : (
          <>
            {error && <p className="text-sm text-destructive">{error}</p>}

            <NotificationsBanner token={token!} />

            {/* Due now */}
            {pendingRuns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Due now</CardTitle>
                  <CardDescription>
                    These are ready to pay. Approve and sign in your wallet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingRuns.map((run) => (
                    <DueRunCard
                      key={run.id}
                      run={run}
                      token={token!}
                      onDone={reload}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            <CreateScheduleForm token={token!} onCreated={reload} />

            {/* Existing schedules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your schedules</CardTitle>
                <CardDescription>
                  {loading
                    ? "Loading…"
                    : `${schedules.length} schedule(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {schedules.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground">
                    No schedules yet — create one above.
                  </p>
                )}
                {schedules.map((s) => (
                  <ScheduleRow
                    key={s.id}
                    schedule={s}
                    token={token!}
                    onChange={reload}
                  />
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Notifications opt-in ─────────────────────────────────────────────────────

function NotificationsBanner({ token }: { token: string }) {
  const { supported, subscribed, permission, busy, error, enable } =
    usePushNotifications();

  if (!supported || subscribed) {
    return subscribed ? (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BellRing className="h-3.5 w-3.5 text-primary" /> Notifications on —
        we'll alert you when a payment is due.
      </div>
    ) : null;
  }

  if (permission === "denied") {
    return (
      <p className="text-xs text-muted-foreground">
        Notifications are blocked in your browser settings. Enable them for this
        site to get due-payment alerts.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-border p-3 flex items-center justify-between gap-3">
      <div className="flex items-start gap-2">
        <Bell className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium">Get notified when a payment is due</p>
          <p className="text-xs text-muted-foreground">
            A browser alert each time a scheduled run needs your approval.
          </p>
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
      </div>
      <Button size="sm" onClick={() => enable(token)} disabled={busy}>
        {busy ? "Enabling…" : "Enable"}
      </Button>
    </div>
  );
}

// ─── Due run card (fetch calldata on demand, then sign) ───────────────────────

function DueRunCard({
  run,
  token,
  onDone,
}: {
  run: ScheduleRun;
  token: string;
  onDone: () => void;
}) {
  const [prepared, setPrepared] = useState<AgentPreparedTx | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = run.schedule?.label || describeSchedule(run.schedule);

  const prepare = async () => {
    setPreparing(true);
    setError(null);
    try {
      setPrepared(await prepareScheduleRun(token, run.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare payment");
    } finally {
      setPreparing(false);
    }
  };

  if (prepared) {
    return (
      <PreparedTxCard
        tx={prepared}
        onSigned={(txHash) => {
          markScheduleRunSigned(token, run.id, txHash)
            .then(onDone)
            .catch(() => {});
        }}
      />
    );
  }

  return (
    <div className="rounded-xl border border-border p-3 space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">
        Due {new Date(run.dueAt).toLocaleString()}
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button size="sm" className="w-full" onClick={prepare} disabled={preparing}>
        {preparing ? "Preparing…" : "Prepare & pay"}
      </Button>
    </div>
  );
}

// ─── Schedule row (pause / resume / cancel) ───────────────────────────────────

function ScheduleRow({
  schedule,
  token,
  onChange,
}: {
  schedule: Schedule;
  token: string;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      onChange();
    } finally {
      setBusy(false);
    }
  };

  const statusColor =
    schedule.status === "active"
      ? "text-green-600"
      : schedule.status === "paused"
        ? "text-yellow-600"
        : "text-muted-foreground";

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {schedule.label || describeSchedule(schedule)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {schedule.cadence} · {schedule.tokenSymbol} ·{" "}
            <span className={statusColor}>{schedule.status}</span>
          </p>
          {schedule.status === "active" && (
            <p className="text-xs text-muted-foreground">
              Next: {new Date(schedule.nextRunAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {schedule.status === "active" && (
            <Button
              size="icon"
              variant="ghost"
              disabled={busy}
              title="Pause"
              onClick={() => act(() => pauseSchedule(token, schedule.id))}
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}
          {schedule.status === "paused" && (
            <Button
              size="icon"
              variant="ghost"
              disabled={busy}
              title="Resume"
              onClick={() => act(() => resumeSchedule(token, schedule.id))}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          {(schedule.status === "active" || schedule.status === "paused") && (
            <Button
              size="icon"
              variant="ghost"
              disabled={busy}
              title="Cancel"
              onClick={() => act(() => cancelSchedule(token, schedule.id))}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateScheduleForm({
  token,
  onCreated,
}: {
  token: string;
  onCreated: () => void;
}) {
  const isMiniPay = useIsMiniPay();
  const tokens = filterTokensForEnv(TOKENS, isMiniPay);
  const [kind, setKind] = useState<ScheduleKind>("airtime");
  const [tokenSymbol, setTokenSymbol] = useState("USDC");
  const [cadence, setCadence] = useState<ScheduleCadence>("weekly");
  const [label, setLabel] = useState("");
  const [spendCapUsd, setSpendCapUsd] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  // airtime
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amountNgn, setAmountNgn] = useState("");
  const [network, setNetwork] = useState("MTN");

  // payroll
  const [recipientsText, setRecipientsText] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const submit = async () => {
    setSaving(true);
    setError(null);
    setOk(false);
    try {
      const payload: CreateSchedulePayload = {
        kind,
        tokenSymbol,
        cadence,
        label: label || undefined,
        spendCapUsd: spendCapUsd ? Number(spendCapUsd) : undefined,
        startAt: startAt ? new Date(startAt).toISOString() : undefined,
        endAt: endAt ? new Date(endAt).toISOString() : undefined,
      };

      if (kind === "airtime") {
        payload.phoneNumber = phoneNumber.trim();
        payload.amountNgn = Number(amountNgn);
        payload.network = network;
      } else {
        payload.recipients = parseRecipients(recipientsText);
        if (payload.recipients.length === 0)
          throw new Error("Add at least one recipient (address,amount per line)");
      }

      await createSchedule(token, payload);
      setOk(true);
      setLabel("");
      setPhoneNumber("");
      setAmountNgn("");
      setRecipientsText("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> New schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* kind */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setKind("airtime")}
            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
              kind === "airtime"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            Airtime
          </button>
          <button
            type="button"
            onClick={() => setKind("batch-transfer")}
            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
              kind === "batch-transfer"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            Payroll (batch)
          </button>
        </div>

        {kind === "airtime" ? (
          <div className="space-y-3">
            <input
              className={inputClass}
              placeholder="Phone number (e.g. 08012345678)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputClass}
                type="number"
                placeholder="Amount (₦)"
                value={amountNgn}
                onChange={(e) => setAmountNgn(e.target.value)}
              />
              <select
                className={inputClass}
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
              >
                {NETWORKS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <textarea
              className={`${inputClass} h-24 py-2`}
              placeholder={"One recipient per line:\n0xabc...,5\n0xdef...,10"}
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Format: address,amount (in {tokenSymbol}) per line.
            </p>
          </div>
        )}

        {/* token + cadence */}
        <div className="grid grid-cols-2 gap-2">
          <select
            className={inputClass}
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
          >
            {tokens.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className={inputClass}
            value={cadence}
            onChange={(e) => setCadence(e.target.value as ScheduleCadence)}
          >
            {CADENCES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* optional */}
        <input
          className={inputClass}
          placeholder="Label (optional, e.g. Airtime for Mum)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">Start (optional)</label>
            <input
              className={inputClass}
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">End (optional)</label>
            <input
              className={inputClass}
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </div>
        </div>
        <input
          className={inputClass}
          type="number"
          placeholder="Per-run spend cap in USD (optional)"
          value={spendCapUsd}
          onChange={(e) => setSpendCapUsd(e.target.value)}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}
        {ok && <p className="text-sm text-green-600">Schedule created.</p>}

        <Button onClick={submit} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating…
            </>
          ) : (
            "Create schedule"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseRecipients(text: string): { address: string; amount: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [address, amount] = line.split(",").map((p) => p.trim());
      return { address, amount };
    })
    .filter((r) => r.address && r.amount);
}

function describeSchedule(schedule: Schedule | null): string {
  if (!schedule) return "Scheduled payment";
  if (schedule.kind === "airtime" && "phoneNumber" in schedule.params) {
    const p = schedule.params;
    return `₦${p.amountNgn} ${p.network} airtime → ${p.phoneNumber}`;
  }
  if ("recipients" in schedule.params) {
    return `Payroll → ${schedule.params.recipients.length} recipient(s)`;
  }
  return "Scheduled payment";
}
