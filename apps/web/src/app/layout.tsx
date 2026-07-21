import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { WalletProvider } from "@/components/wallet-provider";
import { MiniPayAutoConnect } from "@/components/minipay-autoconnect";
import { PostHogProvider } from "@/components/posthog-provider";
import { PostHogIdentify } from "@/components/posthog-identify";
import { ssrWagmiConfig } from "@/lib/wagmi-ssr";
import { FarcasterProvider } from "@/components/farcaster-provider";
import { PaymasterProvider } from "@/components/paymaster-provider";

export const metadata: Metadata = {
  title: "Gigi-pay",
  description:
    "Gigi-pay is a Celo-powered payment protocol designed to make on-chain transfers faster, cheaper, and more inclusive. With Gigipay, users can send funds to multiple wallet addresses in a single transaction—reducing gas costs, saving time, and simplifying complex payouts. But it goes further: Gigipay introduces claim-code payments, enabling users to send crypto without needing the recipient's wallet address. Instead, a secure claim code is generated, and the receiver can redeem it at any time, even if they don't yet have a wallet—making it perfect for giveaways, community rewards, and onboarding new Web3 users.",
  other: {
    "base:app_id": "696fa940f22fe462e74c16ed",
    "talentapp:project_verification":
      "590ca9b315195a4c6027162d5fef19452b90abc2f06e7013f818ffc8a4a04eb81ae74ca9474ea4f7060a8b2e54985e0f53c75668d815fd2974975e2926b13ba7",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hydrate wagmi's connection state from cookies so a previously connected
  // wallet is already connected on first server render — no reconnect prompt.
  const initialState = cookieToInitialState(
    ssrWagmiConfig,
    (await headers()).get("cookie"),
  );

  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <PostHogProvider>
          <FarcasterProvider>
            <div className="relative flex min-h-screen flex-col">
              <WalletProvider initialState={initialState}>
                <MiniPayAutoConnect />
                <PostHogIdentify />
                <PaymasterProvider>
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </PaymasterProvider>
              </WalletProvider>
            </div>
          </FarcasterProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
