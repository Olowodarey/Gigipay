import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Gigipay",
  description: "How Gigipay handles your data.",
};

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().getFullYear()}
          </p>

          <h2 className="text-lg font-semibold">1. What we collect</h2>
          <p>
            Gigipay is non-custodial. We collect only what’s needed to run the
            service: your wallet address (to scope your schedules and profile),
            an optional email/phone/display name if you add them, and phone
            numbers you enter to deliver airtime. Payment amounts and recipients
            are recorded on the public blockchain, not by us.
          </p>

          <h2 className="text-lg font-semibold">2. How we use it</h2>
          <p>
            We use this data to deliver airtime and bill payments, run your
            recurring payments, show your activity, and send you due-payment
            notifications if you opt in. We do not sell your data.
          </p>

          <h2 className="text-lg font-semibold">3. Third parties</h2>
          <p>
            We rely on third-party providers for airtime/bill fulfilment, exchange
            rates, and (optionally) embedded wallet sign-in. They receive only the
            data needed to perform their function (for example, a phone number and
            amount to deliver airtime).
          </p>

          <h2 className="text-lg font-semibold">4. Notifications</h2>
          <p>
            If you enable notifications, we store a push subscription so we can
            alert you when a scheduled payment is due. You can turn this off at any
            time from your browser or the app.
          </p>

          <h2 className="text-lg font-semibold">5. Contact</h2>
          <p>
            Questions about your data? Reach us on{" "}
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
