import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swap — Gigipay",
  description:
    "Swap between tokens instantly across Celo and Base. Coming soon.",
};

export default function SwapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
