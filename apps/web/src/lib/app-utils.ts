/**
 * Format a number as currency using the browser's Intl API.
 * @param amount - The numeric value to format
 * @param currency - ISO 4217 currency code (default: 'USD')
 * @example formatCurrency(1500, 'NGN') // '₦1,500.00'
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Truncate an Ethereum address for display (e.g. 0x1234...abcd).
 * @param address - Full hex address string
 * @param startLength - Characters to keep from the start (default: 6)
 * @param endLength - Characters to keep from the end (default: 4)
 * @example truncateAddress('0xabcdef1234567890') // '0xabcd...7890'
 */
export function truncateAddress(
  address: string,
  startLength = 6,
  endLength = 4,
): string {
  if (address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Returns true if the given string is a valid checksummed or lowercase Ethereum address.
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Resolves after the given number of milliseconds.
 * Useful for polling loops and artificial delays.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format a token amount with a fixed number of decimal places.
 * Strips trailing zeros for cleaner display.
 * @example formatTokenAmount('1.50000', 4) // '1.5'
 */
export function formatTokenAmount(
  amount: string | number,
  decimals = 4,
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  return parseFloat(num.toFixed(decimals)).toString();
}
