# CDP Paymaster Setup Guide

This guide explains how to configure and use the Coinbase Developer Platform (CDP) Paymaster integration for gas-sponsored transactions in Gigipay.

## Prerequisites

1. **CDP Account**: Create an account at [https://portal.cdp.coinbase.com/](https://portal.cdp.coinbase.com/)
2. **API Key**: You'll need a CDP API key for the Paymaster service

## Setup Steps

### 1. Get Your CDP API Key

1. Go to [https://portal.cdp.coinbase.com/](https://portal.cdp.coinbase.com/)
2. Create a new project or select an existing one
3. Navigate to **"Node"** in the left sidebar
4. Select **"Base"** (mainnet) from the network dropdown
   - For testing, you can use **"Base Sepolia"** testnet instead
5. Copy your RPC URL - it should look like:

   ```
   # Base Mainnet (Production)
   https://api.developer.coinbase.com/rpc/v1/base/<your_api_key>

   # Base Sepolia (Testing)
   https://api.developer.coinbase.com/rpc/v1/base-sepolia/<your_api_key>
   ```

### 2. Configure Paymaster Settings

1. In the CDP Portal, navigate to **"Paymaster"** in the left sidebar
2. **Enable the Paymaster** by toggling it on
3. **Configure Gas Policy**:
   - Set per-user sponsorship limits (e.g., 0.01 ETH per day)
   - Set global sponsorship limits
   - **Allowlist contracts** (optional but recommended for security)
     - Add contract addresses you want to sponsor
     - Specify which functions to sponsor
     - This prevents unintended gas sponsorship

### 3. Set Up Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your CDP API key:

   ```env
   NEXT_PUBLIC_CDP_API_KEY=your_actual_api_key_here
   # Base Mainnet (Production - Default)
   NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/your_actual_api_key_here

   # Or for testing, use Base Sepolia:
   # NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base-sepolia/your_actual_api_key_here
   ```

3. **Important**: Never commit `.env.local` to version control!

### 4. Restart Development Server

```bash
npm run dev
```

## Usage

### Using the Paymaster Hook

The `usePaymaster` hook provides access to smart account functionality:

```tsx
import { usePaymaster } from "@/components/paymaster-provider";

function MyComponent() {
  const {
    smartAccountAddress,
    isCreatingSmartAccount,
    createSmartAccountFromPrivateKey,
    sendSponsoredTransaction,
    error,
  } = usePaymaster();

  // Create a smart account
  const handleCreateAccount = async () => {
    try {
      const privateKey = "0x..."; // User's private key
      const address = await createSmartAccountFromPrivateKey(privateKey);
      console.log("Smart account created:", address);
    } catch (err) {
      console.error("Failed to create smart account:", err);
    }
  };

  // Send a sponsored transaction (no gas required from user!)
  const handleSendTransaction = async () => {
    try {
      const txHash = await sendSponsoredTransaction(
        "0xRecipientAddress",
        "0xEncodedFunctionData",
        0n, // value in wei
      );
      console.log("Transaction sent:", txHash);
    } catch (err) {
      console.error("Failed to send transaction:", err);
    }
  };

  return (
    <div>
      {smartAccountAddress && <p>Smart Account: {smartAccountAddress}</p>}
      <button onClick={handleCreateAccount}>Create Smart Account</button>
      <button onClick={handleSendTransaction}>
        Send Sponsored Transaction
      </button>
    </div>
  );
}
```

### Example: Gas-Free Claim Code Redemption

```tsx
import { usePaymaster } from "@/components/paymaster-provider";
import { encodeFunctionData } from "viem";

function ClaimPayment() {
  const { sendSponsoredTransaction } = usePaymaster();

  const handleClaim = async (claimCode: string) => {
    // Encode the contract function call
    const data = encodeFunctionData({
      abi: YourContractABI,
      functionName: "claimPayment",
      args: [claimCode],
    });

    // Send transaction - gas will be sponsored!
    const txHash = await sendSponsoredTransaction(contractAddress, data, 0n);

    console.log("Claimed payment:", txHash);
  };

  return (
    <button onClick={() => handleClaim("ABC123")}>
      Claim Payment (Free - No Gas Required!)
    </button>
  );
}
```

## Available Networks

The integration currently supports:

- **Base Mainnet** - Production (default)
- **Base Sepolia** (testnet) - For testing

To switch networks, update the `NEXT_PUBLIC_PAYMASTER_URL` in `.env.local`:

```env
# For Base Mainnet (Production - Default)
NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/<your_api_key>

# For Base Sepolia (Testing)
NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base-sepolia/<your_api_key>
```

## Wallet Provider Updates

The wallet provider now supports the following chains:

- Celo Mainnet
- Celo Alfajores (testnet)
- Celo Sepolia (testnet)
- **Base Mainnet** (new)
- **Base Sepolia** (new)

Users can switch between these networks in their wallet.

## Troubleshooting

### Error: "NEXT_PUBLIC_PAYMASTER_URL is not configured"

- Make sure you've created `.env.local` and added your API key
- Restart the development server after adding environment variables

### Error: "Failed to create smart account"

- Check that your CDP API key is valid
- Verify the Paymaster is enabled in the CDP Portal
- Check network connectivity

### Transactions Not Being Sponsored

- Verify gas policy is configured in CDP Portal
- Check that contracts are allowlisted (if using allowlist)
- Ensure you haven't exceeded sponsorship limits
- Check CDP Portal dashboard for sponsorship status

## Gas Credits

- CDP provides initial gas credits for testing
- For production use, [apply for additional gas credits](https://docs.google.com/forms/d/1yPnBFW0bVUNLUN_w3ctCqYM9sjdIQO3Typ53KXlsS5g/viewform)
- Monitor usage in the CDP Portal dashboard

## Security Best Practices

1. **Never expose private keys** in client-side code
2. **Use allowlists** to restrict which contracts can be sponsored
3. **Set reasonable sponsorship limits** to control costs
4. **Monitor usage** regularly in the CDP Portal
5. **Keep API keys secure** - never commit to version control

## Next Steps

- Integrate gas sponsorship into claim-code redemption feature
- Add UI indicators for "gas-free" transactions
- Implement smart account creation flow for new users
- Test on Base Sepolia testnet before production deployment

## Resources

- [CDP Documentation](https://docs.cdp.coinbase.com/)
- [Paymaster Guide](https://docs.cdp.coinbase.com/paymaster/docs/welcome)
- [CDP Portal](https://portal.cdp.coinbase.com/)
- [permissionless.js Docs](https://docs.pimlico.io/permissionless)
