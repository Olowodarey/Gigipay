"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { useAccount } from "wagmi";
import { ClientOnly } from "@/components/batch-payment/ClientOnly";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PreparedTxCard } from "@/components/PreparedTxCard";
import { useAuth } from "@/hooks/useAuth";
import {
  sendAgentMessage,
  createSchedule,
  listSchedules,
  listScheduleRuns,
  prepareScheduleRun,
  markScheduleRunSigned,
  type AgentMessage,
  type AgentPreparedTx,
  type AgentPreparedSchedule,
  type AgentAction,
  type Schedule,
  type ScheduleRun,
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
  const [schedules, setSchedules] = useState<AgentPreparedSchedule[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transactions, schedules, actions, loading]);

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
      if (res.schedules?.length) {
        setSchedules((prev) => [...prev, ...res.schedules]);
      }
      if (res.actions?.length) {
        setActions((prev) => [...prev, ...res.actions]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Send ₦500 MTN airtime to 08012345678 with USDC",
    "Every Friday send ₦1000 MTN airtime to 08012345678",
    "How much is ₦2000 in USDT?",
    "Show my schedules",
    "What's due to pay?",
    "Show my last 5 payments",
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
                  <PreparedTxCard key={tx.id} tx={tx} />
                ))}

                {/* Proposed recurring schedules */}
                {schedules.map((s) => (
                  <ScheduleConfirmCard key={s.id} schedule={s} />
                ))}

                {/* Data actions (schedules / due / recent activity) */}
                {actions.map((a, i) => (
                  <AgentActionCard key={`action-${i}`} action={a} />
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

// ─── Schedule confirmation card (confirm → save via authenticated API) ─────────

function ScheduleConfirmCard({
  schedule,
}: {
  schedule: AgentPreparedSchedule;
}) {
  const { token, isAuthenticating, signIn } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!token) {
      signIn();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createSchedule(token, schedule.payload);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <CalendarClock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium">Recurring payment</p>
          <p className="text-xs text-muted-foreground">{schedule.summary}</p>
        </div>
      </div>

      {saved ? (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Schedule saved ·{" "}
          <Link href="/schedules" className="text-primary hover:underline">
            manage
          </Link>
        </div>
      ) : (
        <Button
          size="sm"
          className="w-full"
          onClick={save}
          disabled={saving || isAuthenticating}
        >
          {saving
            ? "Saving…"
            : isAuthenticating
              ? "Signing in…"
              : token
                ? "Create schedule"
                : "Sign in to save"}
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Data action cards (list schedules / due / recent activity) ────────────────

function AgentActionCard({ action }: { action: AgentAction }) {
  const { token, isAuthenticating, signIn } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);
  const [runs, setRuns] = useState<ScheduleRun[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsData =
    action.type === "list_schedules" ||
    action.type === "list_due" ||
    action.type === "recent_activity";

  const load = useCallback(async () => {
    if (!token || !needsData) return;
    setLoading(true);
    setError(null);
    try {
      if (action.type === "list_schedules") {
        setSchedules(await listSchedules(token));
      } else {
        setRuns(await listScheduleRuns(token));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load that.");
    } finally {
      setLoading(false);
    }
  }, [token, needsData, action.type]);

  useEffect(() => {
    load();
  }, [load]);

  if (action.type === "navigate") {
    return (
      <Link
        href={action.href}
        className="inline-flex items-center gap-1 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm hover:border-primary transition-colors"
      >
        <ExternalLink className="h-4 w-4 text-primary" /> {action.label}
      </Link>
    );
  }

  if (needsData && !token) {
    return (
      <div className="rounded-xl border border-border p-3 text-sm">
        <p className="text-muted-foreground mb-2">
          Sign in (a quick, free signature) so I can show your data.
        </p>
        <Button size="sm" onClick={signIn} disabled={isAuthenticating}>
          {isAuthenticating ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> loading…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (action.type === "list_schedules") {
    if (!schedules) return null;
    if (schedules.length === 0)
      return (
        <EmptyState text="You don't have any schedules yet. Try “Every Friday send ₦1000 MTN airtime to 08012345678”." />
      );
    return (
      <div className="space-y-2">
        {schedules.map((s) => (
          <div key={s.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm font-medium truncate">
                {s.label || describeSchedule(s)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {s.cadence} · {s.tokenSymbol} · {s.status}
              {s.status === "active" &&
                ` · next ${new Date(s.nextRunAt).toLocaleDateString()}`}
            </p>
          </div>
        ))}
        <ManageLink />
      </div>
    );
  }

  if (action.type === "list_due") {
    const due = (runs ?? []).filter((r) => r.status === "pending");
    if (due.length === 0)
      return <EmptyState text="Nothing is due right now — you're all caught up. 🎉" />;
    return (
      <div className="space-y-2">
        {due.map((run) => (
          <DueRunPayCard key={run.id} run={run} token={token!} />
        ))}
      </div>
    );
  }

  // recent_activity
  const recent = (runs ?? [])
    .filter((r) => r.status === "signed" || r.status === "fulfilled")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, action.limit);
  if (recent.length === 0)
    return (
      <EmptyState text="No completed payments yet. Once you sign a scheduled run, it'll show up here." />
    );
  return (
    <div className="space-y-2">
      {recent.map((run) => (
        <div key={run.id} className="rounded-xl border border-border p-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-medium truncate">
              {run.schedule?.label || describeSchedule(run.schedule)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {run.status} · {new Date(run.updatedAt).toLocaleString()}
          </p>
        </div>
      ))}
      <ManageLink />
    </div>
  );
}

function DueRunPayCard({ run, token }: { run: ScheduleRun; token: string }) {
  const [prepared, setPrepared] = useState<AgentPreparedTx | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (prepared) {
    return (
      <PreparedTxCard
        tx={prepared}
        onSigned={(txHash) => {
          markScheduleRunSigned(token, run.id, txHash).catch(() => {});
        }}
      />
    );
  }

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

  return (
    <div className="rounded-xl border border-border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm font-medium truncate">
          {run.schedule?.label || describeSchedule(run.schedule)}
        </p>
      </div>
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

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-sm text-muted-foreground rounded-xl border border-border p-3">
      {text}
    </p>
  );
}

function ManageLink() {
  return (
    <Link
      href="/schedules"
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      Manage in Schedules <ExternalLink className="h-3 w-3" />
    </Link>
  );
}

function describeSchedule(schedule: Schedule | null): string {
  if (!schedule) return "Scheduled payment";
  const p = schedule.params as {
    phoneNumber?: string;
    amountNgn?: number;
    network?: string;
    recipients?: { address: string; amount: string }[];
  };
  if (schedule.kind === "airtime" && p.phoneNumber) {
    return `₦${p.amountNgn} ${p.network} airtime → ${p.phoneNumber}`;
  }
  if (p.recipients) {
    return `Payroll → ${p.recipients.length} recipient(s)`;
  }
  return "Scheduled payment";
}
