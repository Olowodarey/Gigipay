import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Airtime — Gigipay",
  description:
    "Send airtime to multiple Nigerian numbers in one session. Upload a CSV or add recipients manually.",
};

export default function BulkAirtimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
