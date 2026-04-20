import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Phone,
  Gift,
  Users,
  Mail,
  Wallet,
  CheckCircle,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

const Hero = () => {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent font-medium">
                <Zap className="h-3.5 w-3.5" />
                Powered by Celo &amp; Base blockchain
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Pay Anyone, Anywhere —{" "}
                <span className="text-accent">Just a Gmail Needed</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Send crypto payments, run giveaways, and top up airtime — all
                on-chain. Recipients only need a Gmail address. No wallet setup,
                no crypto knowledge required.
              </p>

              {/* How it works mini-flow */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
                  <Mail className="h-3.5 w-3.5 text-accent" /> Gmail login
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" />
                <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
                  <Wallet className="h-3.5 w-3.5 text-accent" /> Auto wallet
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" />
                <span className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
                  <CheckCircle className="h-3.5 w-3.5 text-accent" /> Receive
                  crypto
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="text-base">
                  <Link href="/create-payment">
                    Create a Payment
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base bg-transparent"
                >
                  <Link href="/claim-payment">Claim a Payment</Link>
                </Button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-3xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg space-y-4">
                  {/* Mock payment card */}
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Gift className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">
                        Team Bonus — Q1 2025
                      </div>
                      <div className="text-xs text-muted-foreground">
                        5 recipients · Celo
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      "alice@gmail.com",
                      "bob@gmail.com",
                      "carol@gmail.com",
                    ].map((email, i) => (
                      <div
                        key={email}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Mail className="h-3 w-3" /> {email}
                        </span>
                        <span className="font-medium text-accent">
                          {[50, 75, 100][i]} cUSD
                        </span>
                      </div>
                    ))}
                    <div className="text-xs text-muted-foreground pt-1">
                      +2 more…
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total sent
                    </span>
                    <span className="text-xl font-bold text-accent">
                      500 cUSD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              How Gigipay Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps — no crypto experience needed on the receiving
              end.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Wallet className="h-6 w-6 text-accent" />,
                title: "Connect &amp; Fund",
                desc: "Connect your wallet (or sign in with Gmail). Choose how much to send and which token to use — CELO, cUSD, USDC, ETH, and more.",
              },
              {
                step: "02",
                icon: <Gift className="h-6 w-6 text-accent" />,
                title: "Create &amp; Share Codes",
                desc: "Set a payment name and generate unique claim codes for each recipient. Share the codes however you like — WhatsApp, email, Twitter.",
              },
              {
                step: "03",
                icon: <CheckCircle className="h-6 w-6 text-accent" />,
                title: "Recipients Claim",
                desc: "Recipients visit Gigipay, enter the payment name and their code, and the crypto lands in their wallet instantly. No setup needed.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="bg-card border border-border rounded-xl p-6 h-full">
                  <div className="text-5xl font-black text-muted/30 absolute top-4 right-6 select-none">
                    {step}
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    {icon}
                  </div>
                  <h3
                    className="text-lg font-semibold text-foreground mb-2"
                    dangerouslySetInnerHTML={{ __html: title }}
                  />
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Everything You Need to Pay People
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're paying a team, running a giveaway, or gifting
              airtime — Gigipay has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Batch Payment */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Batch Payments
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Pay your entire team in one transaction. Add multiple wallet
                addresses and amounts — Gigipay sends them all at once, saving
                you time and gas fees.
              </p>
              <Link
                href="/batch-payment"
                className="text-accent hover:underline text-sm font-medium inline-flex items-center gap-1"
              >
                Send batch payment <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Create Payment / Giveaway */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Payments &amp; Giveaways
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Create voucher-based payments with unique claim codes. Perfect
                for giveaways, bonuses, and rewards. Amounts can be hidden until
                claimed for a mystery prize experience.
              </p>
              <Link
                href="/create-payment"
                className="text-accent hover:underline text-sm font-medium inline-flex items-center gap-1"
              >
                Create a payment <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Claim Payment */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Claim a Payment
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Received a payment code? Enter the voucher name and your unique
                code to claim your crypto instantly. No wallet setup needed —
                just sign in with Gmail and you're done.
              </p>
              <Link
                href="/claim-payment"
                className="text-accent hover:underline text-sm font-medium inline-flex items-center gap-1"
              >
                Claim now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Buy Airtime */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Buy &amp; Gift Airtime
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Top up any Nigerian number instantly using crypto. MTN, Glo,
                Airtel, 9mobile — all supported. Perfect for gifting, employee
                perks, or giveaway prizes.
              </p>
              <Link
                href="/buy-airtime"
                className="text-accent hover:underline text-sm font-medium inline-flex items-center gap-1"
              >
                Buy airtime <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Gmail Login */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Gmail Login
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                No MetaMask? No problem. Sign in with your Google account and
                Gigipay automatically creates a secure embedded wallet for you.
                Start receiving crypto in seconds.
              </p>
              <span className="text-muted-foreground text-sm font-medium">
                Just click "Sign in with Google" →
              </span>
            </div>

            {/* On-chain Security */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                On-chain &amp; Trustless
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Every payment is locked in a smart contract on Celo or Base.
                Funds are only released when the correct claim code is used.
                Unclaimed payments can be refunded by the sender.
              </p>
              <span className="text-muted-foreground text-sm font-medium">
                Your keys, your crypto.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gmail CTA ────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 rounded-2xl p-8 md:p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Globe className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Your Recipients Don't Need Crypto Knowledge
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Gigipay uses Privy to create embedded wallets from Gmail accounts.
              Your team, customers, or giveaway winners just sign in with Google
              — and their wallet is ready. No seed phrases, no browser
              extensions, no confusion.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
              {[
                {
                  icon: <Mail className="h-5 w-5 text-accent" />,
                  title: "Sign in with Gmail",
                  desc: "One click — no wallet setup required",
                },
                {
                  icon: <Wallet className="h-5 w-5 text-accent" />,
                  title: "Wallet auto-created",
                  desc: "Secure embedded wallet, instantly ready",
                },
                {
                  icon: <CheckCircle className="h-5 w-5 text-accent" />,
                  title: "Claim &amp; spend",
                  desc: "Receive crypto, buy airtime, or transfer out",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 bg-background/50 rounded-lg p-4"
                >
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div>
                    <div
                      className="font-semibold text-foreground text-sm"
                      dangerouslySetInnerHTML={{ __html: title }}
                    />
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link href="/create-payment">
                  Start Sending Payments
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base bg-transparent"
              >
                <Link href="/claim-payment">Claim a Payment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
