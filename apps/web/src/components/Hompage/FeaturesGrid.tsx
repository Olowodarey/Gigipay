import Link from "next/link";
import {
  ArrowRight,
  Phone,
  Gift,
  Users,
  Mail,
  CheckCircle,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: <Users className="h-6 w-6 text-accent" />,
    title: "Batch Payments",
    desc: "Pay your entire team in one transaction. Add multiple wallet addresses and amounts — Gigipay sends them all at once, saving you time and gas fees.",
    link: { href: "/batch-payment", label: "Send batch payment" },
  },
  {
    icon: <Gift className="h-6 w-6 text-accent" />,
    title: "Payments & Giveaways",
    desc: "Create voucher-based payments with unique claim codes. Perfect for giveaways, bonuses, and rewards. Amounts can be hidden until claimed for a mystery prize experience.",
    link: { href: "/create-payment", label: "Create a payment" },
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-accent" />,
    title: "Claim a Payment",
    desc: "Received a payment code? Enter the voucher name and your unique code to claim your crypto instantly. No wallet setup needed — just sign in with Gmail and you're done.",
    link: { href: "/claim-payment", label: "Claim now" },
  },
  {
    icon: <Phone className="h-6 w-6 text-accent" />,
    title: "Buy & Gift Airtime",
    desc: "Top up any Nigerian number instantly using crypto. MTN, Glo, Airtel, 9mobile — all supported. Perfect for gifting, employee perks, or giveaway prizes.",
    link: { href: "/buy-airtime", label: "Buy airtime" },
  },
  {
    icon: <Mail className="h-6 w-6 text-accent" />,
    title: "Gmail Login",
    desc: "No MetaMask? No problem. Sign in with your Google account and Gigipay automatically creates a secure embedded wallet for you. Start receiving crypto in seconds.",
    link: null,
    footer: 'Just click "Sign in with Google" →',
  },
  {
    icon: <Shield className="h-6 w-6 text-accent" />,
    title: "On-chain & Trustless",
    desc: "Every payment is locked in a smart contract on Celo or Base. Funds are only released when the correct claim code is used. Unclaimed payments can be refunded by the sender.",
    link: null,
    footer: "Your keys, your crypto.",
  },
];

/** Displays a 3-column grid of Gigipay feature cards with links to each feature. */
export default function FeaturesGrid() {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Everything You Need to Pay People
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're paying a team, running a giveaway, or gifting airtime
            — Gigipay has you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc, link, footer }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                {icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed flex-1">
                {desc}
              </p>
              {link ? (
                <Link
                  href={link.href}
                  className="text-accent hover:underline text-sm font-medium inline-flex items-center gap-1 mt-auto"
                >
                  {link.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="text-muted-foreground text-sm font-medium mt-auto">
                  {footer}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
