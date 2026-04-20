import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Users, Zap, Phone } from "lucide-react";
import { Mail, Wallet, CreditCard, Gift } from "lucide-react";

const Hero = () => {
  return (
    <div>
      <section className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Pay Anyone, Anywhere - Just Gmail Needed
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty">
                Workers receive crypto payments with just their Gmail. No wallet
                setup. Convert to gift cards instantly. Zero crypto knowledge
                required.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-accent" />
                <span>Sign up with Gmail</span>
                <ArrowRight className="h-4 w-4" />
                <Wallet className="h-4 w-4 text-accent" />
                <span>Auto wallet</span>
                <ArrowRight className="h-4 w-4" />
                <CreditCard className="h-4 w-4 text-accent" />
                <span>Gift cards</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link href="/create-payment" prefetch={true}>
                    Pay Team / Create Giveaway
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base bg-transparent"
                >
                  <Link href="/claim-payment" prefetch={true}>
                    Claim Payment
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base bg-transparent"
                >
                  <Link href="/buy-airtime" prefetch={true}>
                    Buy Airtime
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl blur-3xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <Gift className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          Mystery Prize
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Amount hidden until claimed
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-muted rounded-full w-3/4" />
                      <div className="h-3 bg-muted rounded-full w-1/2" />
                      <div className="h-3 bg-muted rounded-full w-5/6" />
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="text-3xl font-bold text-accent">???</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Surprise amount in Celo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Perfect for Every Occasion
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're paying your team, running a giveaway, or gifting
              airtime, Gigipay makes it simple
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Payments Feature */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Team Payments
              </h3>
              <p className="text-muted-foreground mb-4">
                Pay your team members instantly with crypto. No bank accounts
                needed.
              </p>
              <Link
                href="/create-payment"
                className="text-accent hover:underline text-sm font-medium"
              >
                Create Payment →
              </Link>
            </div>

            {/* Giveaways Feature */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Giveaways & Contests
              </h3>
              <p className="text-muted-foreground mb-4">
                Run viral giveaways with mystery prizes. Perfect for engagement
                and rewards.
              </p>
              <Link
                href="/create-payment"
                className="text-accent hover:underline text-sm font-medium"
              >
                Start Giveaway →
              </Link>
            </div>

            {/* Airtime Feature */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Gift Airtime
              </h3>
              <p className="text-muted-foreground mb-4">
                Send airtime to anyone instantly. Perfect for gifts, rewards, or
                employee benefits.
              </p>
              <Link
                href="/buy-airtime"
                className="text-accent hover:underline text-sm font-medium"
              >
                Buy Airtime →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
