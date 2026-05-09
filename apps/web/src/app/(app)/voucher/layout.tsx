import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vouchers — Gigipay",
  description:
    "Create on-chain vouchers with unique claim codes, claim crypto with a code, or reclaim funds from expired vouchers.",
};

export default function VoucherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
