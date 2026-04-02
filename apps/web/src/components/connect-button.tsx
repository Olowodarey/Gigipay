"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/hooks/useAuth";

export function WalletConnectButton() {
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, isAuthenticating, signIn, isMiniPay } =
    useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
        Connect Wallet
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
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
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-3 py-2"
                  type="button"
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
                  {account.displayBalance ? ` (${account.displayBalance})` : ""}
                </button>

                {/* Show sign-in button if wallet connected but not authenticated */}
                {!isAuthenticated && !isAuthenticating && (
                  <button
                    onClick={signIn}
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  >
                    Sign In
                  </button>
                )}

                {isAuthenticating && (
                  <span className="text-xs text-muted-foreground">
                    Signing in...
                  </span>
                )}
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
