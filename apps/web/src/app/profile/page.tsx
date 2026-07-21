"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useAccount } from "wagmi";
import { ClientOnly } from "@/components/batch-payment/ClientOnly";
import { Copy, Check, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

/** Small inline copy-to-clipboard button with a 2-second "Copied!" confirmation state. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ProfileContent() {
  const { profile, loading, isLoggedIn, logout } = useUser();
  const { chain } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) router.push("/");
  }, [loading, isLoggedIn, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground text-sm">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  const walletAddress = profile.address;
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <div className="rounded-xl border border-border bg-card p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
            {profile.isMiniPay ? "📱" : "🦊"}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">
              {profile.displayName ||
                profile.email ||
                profile.phone ||
                "My Account"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {profile.isMiniPay ? "MiniPay" : "Wallet"}
            </p>
          </div>
        </div>

        <hr className="border-border" />

        <div className="space-y-3">
          {profile.email && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{profile.email}</span>
            </div>
          )}
          {profile.phone && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium">{profile.phone}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-medium">
              {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <hr className="border-border" />

        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Wallet</h2>
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Address</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono">{shortAddress}</span>
                <CopyButton text={walletAddress} />
              </div>
            </div>
            <div className="rounded-md bg-background border border-border px-3 py-2 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-muted-foreground truncate">
                {walletAddress}
              </span>
              <CopyButton text={walletAddress} />
            </div>
            <a
              href={`${chain?.id === 8453 ? "https://basescan.org" : "https://celoscan.io"}/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View on {chain?.id === 8453 ? "Basescan" : "Celoscan"}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <hr className="border-border" />

        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/create-payment"
              prefetch={true}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/40 hover:bg-accent/10 p-3 transition-colors"
            >
              <span className="text-sm font-medium">Create Payment</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/claim-payment"
              prefetch={true}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/40 hover:bg-accent/10 p-3 transition-colors"
            >
              <span className="text-sm font-medium">Claim Payment</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <hr className="border-border" />

        <button
          onClick={logout}
          className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-10 px-4 py-2 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

/** Profile page — displays user info, wallet address, and quick action links. */
export default function ProfilePage() {
  return (
    <ClientOnly>
      <ProfileContent />
    </ClientOnly>
  );
}
