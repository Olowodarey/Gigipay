"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { usePrivy } from "@privy-io/react-auth";
import { ClientOnly } from "@/components/batch-payment/ClientOnly";
import { Copy, Check, ExternalLink, Wallet } from "lucide-react";

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
  const { embeddedWallet } = usePrivyAuth();
  const { createWallet } = usePrivy();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const walletAddress =
    embeddedWallet?.address ??
    (profile.address.startsWith("privy:") ? null : profile.address);

  const hasWallet = !!walletAddress;
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  const handleCreateWallet = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      await createWallet();
      window.location.reload();
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create wallet");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <div className="rounded-xl border border-border bg-card p-8 space-y-6">
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

          {hasWallet ? (
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Address</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono">{shortAddress}</span>
                  <CopyButton text={walletAddress!} />
                </div>
              </div>
              <div className="rounded-md bg-background border border-border px-3 py-2 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-muted-foreground truncate">
                  {walletAddress}
                </span>
                <CopyButton text={walletAddress!} />
              </div>
              <a
                href={`https://celoscan.io/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View on Celoscan
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-5 text-center space-y-3">
              <Wallet className="h-8 w-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">No wallet yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a free embedded wallet to send and receive crypto
                </p>
              </div>
              {createError && (
                <p className="text-xs text-destructive">{createError}</p>
              )}
              <button
                onClick={handleCreateWallet}
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Wallet className="h-4 w-4" />
                {creating ? "Creating wallet..." : "Create Wallet"}
              </button>
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
