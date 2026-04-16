import { useState, useEffect, useRef, useCallback } from "react";
import { convertNgnToToken, type ConvertResult } from "@/lib/api";

interface UseRateResult {
  tokenAmount: string | null; // e.g. "0.054123"
  rate: number | null; // NGN per 1 token
  coinId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Converts an NGN amount to the equivalent token amount for the connected chain.
 * Debounces 400ms so we don't hammer the backend on every keystroke.
 * The backend caches CoinGecko responses for 60s.
 */
export function useRate(
  chainId: number | undefined,
  ngnAmount: string,
): UseRateResult {
  const [result, setResult] = useState<UseRateResult>({
    tokenAmount: null,
    rate: null,
    coinId: null,
    isLoading: false,
    error: null,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch = useCallback(async (id: number, amount: number) => {
    setResult((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data: ConvertResult = await convertNgnToToken(id, amount);
      setResult({
        tokenAmount: data.tokenAmount,
        rate: data.rate,
        coinId: data.coinId,
        isLoading: false,
        error: null,
      });
    } catch {
      setResult((prev) => ({
        ...prev,
        isLoading: false,
        error: "Could not fetch rate",
      }));
    }
  }, []);

  useEffect(() => {
    const amt = parseFloat(ngnAmount);
    if (!chainId || !ngnAmount || isNaN(amt) || amt <= 0) {
      setResult({
        tokenAmount: null,
        rate: null,
        coinId: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetch(chainId, amt), 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [chainId, ngnAmount, fetch]);

  return result;
}
