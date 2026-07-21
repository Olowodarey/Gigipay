"use client";

import { Smartphone, ArrowRight } from "lucide-react";
import { useIsMiniPay } from "@/hooks/useIsMiniPay";
import { openInMiniPayDeeplink, MINIPAY_SITE } from "@/lib/minipay";

/**
 * Compact "No wallet? use MiniPay" nudge. Promotes MiniPay without removing the
 * wallet flow — it's an extra option shown above/around a connect step. Hidden
 * when the visitor is already inside MiniPay.
 */
export function MiniPayNudge({
  title = "No wallet? Claim in MiniPay",
  subtitle = "MiniPay is a stablecoin wallet built into your phone — no setup, network fees handled for you.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const isMiniPay = useIsMiniPay();
  if (isMiniPay) return null;

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Smartphone className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <a
              href={openInMiniPayDeeplink()}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 text-sm font-medium transition-colors"
            >
              Open in MiniPay
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <a
              href={MINIPAY_SITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-accent/10 h-9 px-4 text-sm font-medium transition-colors"
            >
              Get MiniPay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
