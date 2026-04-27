import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Wallet, CheckCircle, Globe } from "lucide-react";

const steps = [
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
    title: "Claim & spend",
    desc: "Receive crypto, buy airtime, or transfer out",
  },
];

/** CTA section explaining Gmail-based onboarding via Privy embedded wallets. */
export default function GmailCTA() {
  return (
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
            Your team, customers, or giveaway winners just sign in with Google —
            and their wallet is ready. No seed phrases, no browser extensions,
            no confusion.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
            {steps.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 bg-background/50 rounded-lg p-4"
              >
                <div className="mt-0.5 shrink-0">{icon}</div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {title}
                  </div>
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
  );
}
