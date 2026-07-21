"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Phone,
  CalendarClock,
  Activity,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMetrics, type GigipayMetrics } from "@/lib/api";

export default function StatsPage() {
  const [data, setData] = useState<GigipayMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getMetrics());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" /> Gigipay Stats
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live activity across Gigipay — airtime top-ups, recurring payments,
            and users. Updated every minute.
            {data && (
              <>
                {" "}
                Last updated {new Date(data.generatedAt).toLocaleString()}.
              </>
            )}
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading && !data && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}

        {data && (
          <>
            {/* Headline tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Tile
                icon={<Users className="h-4 w-4" />}
                label="Users"
                value={data.users.total}
                sub={`${data.users.new30d} new · 30d`}
              />
              <Tile
                icon={<Phone className="h-4 w-4" />}
                label="Airtime paid"
                value={data.airtime.fulfilled}
                sub={`${data.airtime.last30d} tries · 30d`}
              />
              <Tile
                icon={<CalendarClock className="h-4 w-4" />}
                label="Recurring"
                value={data.schedules.active}
                sub={`${data.schedules.total} total`}
              />
              <Tile
                icon={<Activity className="h-4 w-4" />}
                label="Active wallets"
                value={data.activity.activeWallets30d}
                sub="30d"
              />
            </div>

            {/* Engagement (PostHog DAU/MAU) */}
            {data.engagement && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Active users</CardTitle>
                  <CardDescription>
                    Real DAU / MAU from product analytics (distinct wallets).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <Stat label="DAU (1d)" value={data.engagement.dau} />
                    <Stat label="MAU (30d)" value={data.engagement.mau} />
                    <Stat
                      label="Stickiness"
                      value={`${data.engagement.stickinessPct}%`}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Last 14 days</CardTitle>
                <CardDescription>
                  Airtime top-ups and scheduled payment runs per day.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityChart daily={data.daily} />
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <Legend swatch="bg-primary" label="Airtime" />
                  <Legend swatch="bg-green-500" label="Scheduled runs" />
                </div>
              </CardContent>
            </Card>

            {/* Airtime detail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> Airtime
                </CardTitle>
                <CardDescription>
                  Paid in stablecoins, delivered to Nigerian numbers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Fulfilled" value={data.airtime.fulfilled} />
                  <Stat label="Failed" value={data.airtime.failed} />
                  <Stat
                    label="Fail rate"
                    value={`${data.airtime.failedRatePct}%`}
                  />
                  <Stat
                    label="Volume (₦, delivered)"
                    value={`₦${data.airtime.volumeNgnFulfilled.toLocaleString()}`}
                  />
                </div>
                <BreakdownBars
                  title="By network"
                  items={[
                    { label: "MTN", value: data.airtime.byNetwork.MTN },
                    { label: "GLO", value: data.airtime.byNetwork.GLO },
                    { label: "AIRTEL", value: data.airtime.byNetwork.AIRTEL },
                    { label: "9MOBILE", value: data.airtime.byNetwork["9MOBILE"] },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Recurring payments detail */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" /> Recurring
                  payments
                </CardTitle>
                <CardDescription>
                  Scheduled runs the user approves and signs when due.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Completed runs" value={data.runs.completed} />
                  <Stat label="Pending" value={data.runs.pending} />
                  <Stat label="Failed" value={data.runs.failed} />
                  <Stat
                    label="Fail rate"
                    value={`${data.runs.failedRatePct}%`}
                  />
                </div>
                <BreakdownBars
                  title="Schedules by type"
                  items={[
                    { label: "Airtime", value: data.schedules.byKind.airtime },
                    {
                      label: "Payroll",
                      value: data.schedules.byKind["batch-transfer"],
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
              Metrics are aggregated from Gigipay&apos;s own records (users,
              airtime orders, and scheduled runs). Token-level on-chain volume
              per stablecoin will be added via an on-chain indexer.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Small building blocks ──────────────────────────────────────────────────────

function Tile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-lg font-semibold">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}

function ActivityChart({
  daily,
}: {
  daily: GigipayMetrics["daily"];
}) {
  const max = Math.max(1, ...daily.map((d) => d.airtime + d.runs));
  return (
    <div className="flex items-end gap-1 h-32" role="img" aria-label="Daily activity">
      {daily.map((d) => {
        const airtimeH = (d.airtime / max) * 100;
        const runsH = (d.runs / max) * 100;
        const day = new Date(d.date + "T00:00:00");
        return (
          <div
            key={d.date}
            className="flex-1 flex flex-col justify-end items-center gap-0.5 group relative"
            title={`${day.toLocaleDateString()}: ${d.airtime} airtime, ${d.runs} runs`}
          >
            <div className="w-full flex flex-col justify-end" style={{ height: "100%" }}>
              <div
                className="w-full rounded-t-sm bg-green-500"
                style={{ height: `${runsH}%` }}
              />
              <div
                className="w-full bg-primary"
                style={{ height: `${airtimeH}%` }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">
              {day.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BreakdownBars({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2">
          <span className="w-16 text-xs text-muted-foreground">{i.label}</span>
          <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-primary/70 rounded"
              style={{ width: `${(i.value / max) * 100}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-medium">{i.value}</span>
        </div>
      ))}
    </div>
  );
}
