import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Gigipay",
  description: "The terms governing your use of Gigipay.",
};

export default function TermsPage() {
  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-2xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
          <h1 className="text-2xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().getFullYear()}
          </p>

          <h2 className="text-lg font-semibold">1. What Gigipay is</h2>
          <p>
            Gigipay is a non-custodial, on-chain payments application on the Celo
            and Base networks. It lets you send batch payments, create and claim
            payment vouchers, buy airtime, and set up recurring payments. Gigipay
            never holds your funds or your keys — every payment is signed by you
            in your own wallet.
          </p>

          <h2 className="text-lg font-semibold">2. Your responsibilities</h2>
          <p>
            You are responsible for the security of your wallet, for the accuracy
            of the details you enter (recipient addresses, phone numbers, amounts),
            and for complying with the laws that apply to you. On-chain transactions
            are irreversible; Gigipay cannot reverse a confirmed payment.
          </p>

          <h2 className="text-lg font-semibold">3. Airtime & bill payments</h2>
          <p>
            Airtime and bill fulfilment is delivered through third-party providers.
            Delivery times and availability depend on those providers and the
            mobile network. Provide the correct phone number and network — Gigipay
            is not liable for delivery to an incorrect number you supplied.
          </p>

          <h2 className="text-lg font-semibold">4. No warranty</h2>
          <p>
            Gigipay is provided “as is”, without warranties of any kind. Network
            fees, exchange rates, and token availability may change. To the maximum
            extent permitted by law, Gigipay is not liable for indirect or
            consequential losses arising from your use of the app.
          </p>

          <h2 className="text-lg font-semibold">5. Contact</h2>
          <p>
            Questions about these terms? Reach us on{" "}
            <a
              href="https://t.me/gigipay"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Telegram
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
