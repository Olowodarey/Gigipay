"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useState, useEffect } from "react";

// Stable skeleton — same size as the real button, no layout shift
function ButtonSkeleton() {
  return (
    <div className="h-10 w-44 rounded-md border border-input bg-background animate-pulse opacity-40" />
  );
}

function ConnectButtonInner() {
  const { user, isMiniPay } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <ButtonSkeleton />;

  // MiniPay: zero-click connect. Never show a "Connect Wallet" button, no chain
  // switcher, no CELO balance, no raw 0x as the primary label. The injected
  // wallet auto-connects (see MiniPayAutoConnect).
  if (isMiniPay) {
    return <MiniPayAccountChip label={user?.displayName} />;
  }

  // Website: wallet connect only.
  return (
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
                Connect Wallet
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
                  {user?.displayName || account.displayName}
                  {account.displayBalance ? ` (${account.displayBalance})` : ""}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

/**
 * MiniPay account chip — phone-first identity, no address/balance/chain shown.
 * While the injected wallet is still auto-connecting, renders nothing.
 */
function MiniPayAccountChip({ label }: { label?: string }) {
  const { isConnected } = useAccount();
  if (!isConnected) return null;
  return (
    <Link
      href="/profile"
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1"
    >
      <span className="text-xs">📱</span>
      {label || "My Account"}
    </Link>
  );
}

export function WalletConnectButton() {
  return <ConnectButtonInner />;
}
