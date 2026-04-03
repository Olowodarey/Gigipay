import type { Metadata } from "next";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import { WalletProvider } from "@/components/wallet-provider";
import { FarcasterProvider } from "@/components/farcaster-provider";
import { PaymasterProvider } from "@/components/paymaster-provider";
import { PrivyAuthProvider } from "@/components/privy-provider";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <PrivyAuthProvider>
          <FarcasterProvider>
            <div className="relative flex min-h-screen flex-col">
              <WalletProvider>
                <PaymasterProvider>
                  <Navbar />
                  <main className="flex-1">{children}</main>
                </PaymasterProvider>
              </WalletProvider>
            </div>
          </FarcasterProvider>
        </PrivyAuthProvider>
      </body>
    </html>
  );
}
