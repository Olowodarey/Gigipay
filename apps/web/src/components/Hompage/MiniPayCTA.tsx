"use client";

import { Smartphone, Zap, ShieldCheck, ArrowRight, Ticket } from "lucide-react";
import { useIsMiniPay } from "@/hooks/useIsMiniPay";
import { openInMiniPayDeeplink, MINIPAY_SITE } from "@/lib/minipay";

const OPEN_IN_MINIPAY = openInMiniPayDeeplink();
const GET_MINIPAY = MINIPAY_SITE;

const perks = [
  {
    icon: <Zap className="h-4 w-4" />,
    title: "No connect step",
    desc: "Gigipay opens already connected — start paying instantly.",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    title: "Network fees handled",
    desc: "MiniPay covers the network fee — you just pay in stablecoins.",
  },
  {
    icon: <Ticket className="h-4 w-4" />,
    title: "Claim in seconds",
    desc: "Got a payment code? Claim it with no wallet setup at all.",
  },
];

/**
 * Homepage CTA that funnels website visitors into MiniPay — the best (zero-click,
 * fee-abstracted) way to use Gigipay. Hidden when already inside MiniPay.
 */
export default function MiniPayCTA() {
  const isMiniPay = useIsMiniPay();
  if (isMiniPay) return null;

  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1 text-xs font-medium">
                <Smartphone className="h-3.5 w-3.5 text-accent" /> Best on
                MiniPay
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Claim &amp; pay inside MiniPay
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MiniPay is a stablecoin wallet built into your phone — no seed
                phrases, no network-fee juggling. Open Gigipay in MiniPay to
                claim payments and top up airtime in a couple of taps.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href={OPEN_IN_MINIPAY}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5 text-sm font-medium transition-colors"
                >
                  Open in MiniPay
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={GET_MINIPAY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background hover:bg-accent/10 h-11 px-5 text-sm font-medium transition-colors"
                >
                  Get MiniPay
                </a>
              </div>
            </div>

            <ul className="flex-1 space-y-3">
              {perks.map((p) => (
                <li
                  key={p.title}
                  className="flex items-start gap-3 rounded-xl bg-background/50 border border-border p-3"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    {p.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
