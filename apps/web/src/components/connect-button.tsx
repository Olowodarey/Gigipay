"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/useAuth";
import { usePrivyAuth } from "@/hooks/usePrivyAuth";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { useState, useEffect } from "react";

// Stable skeleton — same size as the real buttons, no layout shift
function ButtonSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-10 w-32 rounded-md border border-input bg-background animate-pulse opacity-40" />
      <div className="h-10 w-44 rounded-md border border-input bg-background animate-pulse opacity-40" />
    </div>
  );
}

function PrivyLoginButton() {
  const { login, authenticated, ready } = usePrivyAuth();
  const { isConnected } = useAccount();
  if (!ready || authenticated || isConnected) return null;

  return (
    <button
      onClick={login}
      type="button"
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Email / Phone
    </button>
  );
}

function PrivyProfileButton() {
  const { authenticated, privyUser } = usePrivyAuth();
  const { profile } = useUser();

  if (!authenticated) return null;

  // Use Privy user data immediately — no need to wait for backend profile
  const label =
    profile?.displayName ||
    profile?.email ||
    privyUser?.email?.address ||
    privyUser?.phone?.number ||
    "My Account";

  return (
    <Link
      href="/profile"
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
    >
      <span className="text-base">✉️</span>
      {label}
    </Link>
  );
}

function ConnectButtonInner() {
  const { user, isAuthenticated, isAuthenticating, signIn, isMiniPay } =
    useAuth();
  const { authenticated: privyAuthenticated, ready: privyReady } =
    usePrivyAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Single stable loading state — wait for client mount + Privy ready
  if (!mounted || !privyReady) return <ButtonSkeleton />;

  // Privy user — show profile only
  if (privyAuthenticated) {
    return <PrivyProfileButton />;
  }

  // Wallet user
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted: rkMounted,
        }) => {
          const connected = rkMounted && account && chain;
          return (
            <div
              {...(!rkMounted && {
                "aria-hidden": true,
                style: { opacity: 0, pointerEvents: "none" as const },
              })}
            >
              {!connected ? (
                <button
                  onClick={openConnectModal}
                  type="button"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  {isMiniPay ? "Connect MiniPay" : "Connect Wallet"}
                </button>
              ) : chain.unsupported ? (
                <button
                  onClick={openChainModal}
                  type="button"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
                >
                  Wrong network
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-3 py-2"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name}
                        src={chain.iconUrl}
                        style={{
                          width: 12,
                          height: 12,
                          marginRight: 4,
                          borderRadius: 999,
                        }}
                      />
                    )}
                    {chain.name}
                  </button>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4 py-2"
                  >
                    {isMiniPay && <span className="mr-1 text-xs">📱</span>}
                    {user?.displayName || account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""}
                  </button>
                </div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
      <PrivyLoginButton />
    </div>
  );
}

export function WalletConnectButton() {
  return <ConnectButtonInner />;
}
