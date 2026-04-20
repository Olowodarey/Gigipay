import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, Mail, Wallet, CheckCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Pay Anyone, Anywhere —{" "}
              <span className="text-accent">Just a Gmail Needed</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Send crypto payments, run giveaways, and top up airtime — all
              on-chain. Recipients only need a Gmail address. No wallet setup,
              no crypto knowledge required.
            </p>

            {/* Mini flow */}
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

          {/* Right Visual — mock payment card */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-3xl" />
              <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg space-y-4">
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
                  {["alice@gmail.com", "bob@gmail.com", "carol@gmail.com"].map(
                    (email, i) => (
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
                    ),
                  )}
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
  );
}
