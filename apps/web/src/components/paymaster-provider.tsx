"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { type Address, type Hash } from "viem";
import { useAccount } from "wagmi";
import {
  createSmartAccountClientWithPaymaster,
  getSmartAccountAddress,
  getChain,
} from "./smart-account-config";

interface PaymasterContextType {
  smartAccountAddress: Address | null;
  isCreatingSmartAccount: boolean;
  createSmartAccountFromPrivateKey: (
    privateKey: `0x${string}`,
  ) => Promise<Address>;
  sendSponsoredTransaction: (
    to: Address,
    data: `0x${string}`,
    value?: bigint,
  ) => Promise<Hash>;
  error: string | null;
}

const PaymasterContext = createContext<PaymasterContextType | undefined>(
  undefined,
);

export function PaymasterProvider({ children }: { children: React.ReactNode }) {
  const [smartAccountAddress, setSmartAccountAddress] =
    useState<Address | null>(null);
  const [isCreatingSmartAccount, setIsCreatingSmartAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedPrivateKey, setCachedPrivateKey] = useState<
    `0x${string}` | null
  >(null);

  /**
   * Create a smart account from a private key
   * This will derive the smart account address
   */
  const createSmartAccountFromPrivateKey = useCallback(
    async (privateKey: `0x${string}`): Promise<Address> => {
      setIsCreatingSmartAccount(true);
      setError(null);

      try {
        const chain = getChain();
        const address = await getSmartAccountAddress(privateKey, chain);

        setSmartAccountAddress(address);
        setCachedPrivateKey(privateKey);

        return address;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create smart account";
        setError(errorMessage);
        throw err;
      } finally {
        setIsCreatingSmartAccount(false);
      }
    },
    [],
  );

  /**
   * Send a sponsored transaction using the smart account
   * Gas fees will be paid by the Paymaster
   */
  const sendSponsoredTransaction = useCallback(
    async (
      to: Address,
      data: `0x${string}`,
      value: bigint = 0n,
    ): Promise<Hash> => {
      if (!cachedPrivateKey) {
        throw new Error(
          "Smart account not initialized. Call createSmartAccountFromPrivateKey first.",
        );
      }

      setError(null);

      try {
        const chain = getChain();
        const smartAccountClient = await createSmartAccountClientWithPaymaster(
          cachedPrivateKey,
          chain,
        );

        // Send the transaction - gas will be sponsored by Paymaster
        const txHash = await smartAccountClient.sendTransaction({
          to,
          data,
          value,
        });

        return txHash;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to send sponsored transaction";
        setError(errorMessage);
        throw err;
      }
    },
    [cachedPrivateKey],
  );

  const value: PaymasterContextType = {
    smartAccountAddress,
    isCreatingSmartAccount,
    createSmartAccountFromPrivateKey,
    sendSponsoredTransaction,
    error,
  };

  return (
    <PaymasterContext.Provider value={value}>
      {children}
    </PaymasterContext.Provider>
  );
}

/**
 * Hook to access Paymaster functionality
 * Use this to create smart accounts and send sponsored transactions
 */
export function usePaymaster() {
  const context = useContext(PaymasterContext);
  if (context === undefined) {
    throw new Error("usePaymaster must be used within a PaymasterProvider");
  }
  return context;
}

/**
 * Example usage:
 *
 * const { createSmartAccountFromPrivateKey, sendSponsoredTransaction, smartAccountAddress } = usePaymaster()
 *
 * // Create smart account
 * const address = await createSmartAccountFromPrivateKey('0x...')
 *
 * // Send sponsored transaction (no gas required from user)
 * const txHash = await sendSponsoredTransaction(
 *   '0xRecipientAddress',
 *   '0xEncodedFunctionData',
 *   0n // value in wei
 * )
 */
