"use client";

import Link from "next/link";
import { Gift, Sparkles, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const actions = [
  {
    title: "Create Voucher",
    description:
      "Set up a batch of on-chain vouchers with unique claim codes. Perfect for giveaways, rewards, and payouts.",
    icon: Sparkles,
    href: "/create-payment",
    cta: "Create now",
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-500",
    border: "hover:border-violet-500/50",
  },
  {
    title: "Claim Voucher",
    description:
      "Have a claim code? Enter it here to receive your crypto payment directly to your wallet.",
    icon: Gift,
    href: "/claim-payment",
    cta: "Claim now",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500",
    border: "hover:border-emerald-500/50",
  },
  {
    title: "Reclaim Voucher",
    description:
      "Recover funds from unclaimed or expired vouchers you created. Get your tokens back in one transaction.",
    icon: RefreshCw,
    href: "/reclaim-payment",
    cta: "Reclaim now",
    gradient: "from-orange-500/10 to-amber-500/10",
    iconColor: "text-orange-500",
    border: "hover:border-orange-500/50",
  },
];

export default function VoucherPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Vouchers</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Create on-chain vouchers with unique claim codes, share them with
            anyone, and let recipients claim their crypto — no wallet required
            to receive a code.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.href}
                className={`relative overflow-hidden border transition-all duration-200 ${action.border} hover:shadow-lg group`}
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                />
                <CardHeader className="relative">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-background border mb-3`}
                  >
                    <Icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button asChild className="w-full group/btn">
                    <Link href={action.href}>
                      {action.cta}
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Vouchers are secured on-chain.{" "}
            <span className="text-foreground font-medium">
              Funds are locked until claimed or reclaimed by the creator.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
