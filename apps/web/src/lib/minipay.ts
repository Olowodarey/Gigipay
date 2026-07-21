/**
 * MiniPay helpers — the app must behave differently inside MiniPay (Celo's
 * stablecoin wallet) vs a normal browser. On the website, users keep every
 * feature (CELO, connect button, SIWE). Inside MiniPay we must comply with its
 * rules: no CELO in the UI, zero-click connect, no message signing.
 */

/** Tokens MiniPay supports. Never show CELO or other native tokens in MiniPay. */
export const MINIPAY_TOKENS = ["USDC", "USDT", "USDm"] as const;

/** MiniPay "Add Cash" (Deposit) deeplink — send users here when balance is low. */
export function addCashDeeplink(tokens: readonly string[] = MINIPAY_TOKENS): string {
  return `https://link.minipay.xyz/add_cash?tokens=${tokens.join(",")}`;
}

/**
 * SSR-safe MiniPay detection. MiniPay injects `window.ethereum.isMiniPay = true`.
 * Returns false during SSR and in normal browsers.
 */
export function detectMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  return (window as { ethereum?: { isMiniPay?: boolean } }).ethereum
    ?.isMiniPay === true;
}

/**
 * Filter a list of token symbols for the current environment. Inside MiniPay,
 * strips CELO / ETH / any non-MiniPay token so only USDC/USDT/USDm remain.
 * On the website, returns the list unchanged.
 */
export function filterTokensForEnv<T extends string>(
  symbols: readonly T[],
  isMiniPay: boolean,
): T[] {
  if (!isMiniPay) return [...symbols];
  return symbols.filter((s) =>
    (MINIPAY_TOKENS as readonly string[]).includes(s),
  );
}
