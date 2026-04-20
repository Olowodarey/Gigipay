import { Wallet, Gift, CheckCircle } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <Wallet className="h-6 w-6 text-accent" />,
    title: "Connect & Fund",
    desc: "Connect your wallet (or sign in with Gmail). Choose how much to send and which token to use — CELO, cUSD, USDC, ETH, and more.",
  },
  {
    step: "02",
    icon: <Gift className="h-6 w-6 text-accent" />,
    title: "Create & Share Codes",
    desc: "Set a payment name and generate unique claim codes for each recipient. Share the codes however you like — WhatsApp, email, Twitter.",
  },
  {
    step: "03",
    icon: <CheckCircle className="h-6 w-6 text-accent" />,
    title: "Recipients Claim",
    desc: "Recipients visit Gigipay, enter the payment name and their code, and the crypto lands in their wallet instantly. No setup needed.",
  },
];

export default function HowItWorks() {
  return (
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
          {steps.map(({ step, icon, title, desc }) => (
            <div key={step} className="relative">
              <div className="bg-card border border-border rounded-xl p-6 h-full">
                <div className="text-5xl font-black text-muted/30 absolute top-4 right-6 select-none">
                  {step}
                </div>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
