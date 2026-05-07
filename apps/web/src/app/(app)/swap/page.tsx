"use client";

import { ArrowLeftRight, Construction } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <ArrowLeftRight className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Swap</h1>
          <p className="text-muted-foreground text-lg max-w-sm mx-auto leading-relaxed">
            Swap between tokens instantly across supported networks.
          </p>
        </div>

        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Construction className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Coming Soon</CardTitle>
            <CardDescription>
              The swap feature is under construction. Check back soon for
              seamless token swaps powered by on-chain liquidity.
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      </div>
    </div>
  );
}
