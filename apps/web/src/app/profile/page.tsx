"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { ClientOnly } from "@/components/batch-payment/ClientOnly";

function ProfileContent() {
  const { profile, loading, isLoggedIn, isPrivyUser, logout } = useUser();
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

  const shortAddress = profile.address.startsWith("privy:")
    ? profile.address
    : `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`;

  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <div className="rounded-xl border border-border bg-card p-8 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
            {isPrivyUser ? "✉️" : "🦊"}
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">
              {profile.displayName ||
                (isPrivyUser ? "Privy User" : "Wallet User")}
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {shortAddress}
            </p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Details */}
        <div className="space-y-4">
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
            <span className="text-sm text-muted-foreground">Login method</span>
            <span className="text-sm font-medium">
              {isPrivyUser
                ? "Email / Phone"
                : profile.isMiniPay
                  ? "MiniPay"
                  : "Wallet"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm font-medium">
              {new Date(profile.createdAt).toLocaleDateString()}
            </span>
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

export default function ProfilePage() {
  return (
    <ClientOnly>
      <ProfileContent />
    </ClientOnly>
  );
}
