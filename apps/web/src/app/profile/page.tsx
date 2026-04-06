"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { ClientOnly } from "@/components/batch-payment/ClientOnly";
import { Copy, Check, ExternalLink } from "lucide-react";

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
  const { profile, loading, isLoggedIn, isPrivyUser, logout } = useUser();
  const { embeddedWallet, privyUser } = usePrivyAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/");
    }
  }, [loading, isLoggedIn, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground text-sm">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  // Prefer the embedded wallet address from Privy (most accurate),
  // fall back to what the backend stored
  const walletAddress =
    embeddedWallet?.address ??
    (profile.address.startsWith("privy:") ? null : profile.address);

  const hasWallet = !!walletAddress;
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  const celoscanUrl = walletAddress
    ? `https://celoscan.io/address/${walletAddress}`
    : null;

  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <div className="rounded-xl border border-border bg-card p-8 space-y-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
            {isPrivyUser ? "✉️" : "🦊"}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">
              {profile.displayName ||
                profile.email ||
                profile.phone ||
                "My Account"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {isPrivyUser
                ? "Email / Phone login"
                : profile.isMiniPay
                  ? "MiniPay"
                  : "Wallet login"}
            </p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Account details */}
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

        {/* Wallet section */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Wallet</h2>

          {hasWallet ? (
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Address</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono">{shortAddress}</span>
                  <CopyButton text={walletAddress!} />
                </div>
              </div>

              {/* Full address copyable */}
              <div className="rounded-md bg-background border border-border px-3 py-2 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-muted-foreground truncate">
                  {walletAddress}
                </span>
                <CopyButton text={walletAddress!} />
              </div>

              {celoscanUrl && (
                <a
                  href={celoscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View on Celoscan
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                No wallet linked yet
              </p>
              <p className="text-xs text-muted-foreground">
                Privy is creating your embedded wallet. Refresh in a moment.
              </p>
            </div>
          )}
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

export default function ProfilePage() {
  return (
    <ClientOnly>
      <ProfileContent />
    </ClientOnly>
  );
}
