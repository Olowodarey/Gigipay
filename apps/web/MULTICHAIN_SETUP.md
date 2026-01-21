# Multi-Chain Contract Setup

Gigipay is now deployed on multiple chains! This guide explains how to use the multi-chain contract configuration.

## Supported Chains

| Chain            | Chain ID | Contract Address                             |
| ---------------- | -------- | -------------------------------------------- |
| **Celo Mainnet** | 42220    | `0xd81462e64951De7395e572D1a157EB9170E1f0Cb` |
| **Base Mainnet** | 8453     | `0x4a7cbbb72768d39f32eb5b3765a135743d6ccb8c` |

## Usage

### Automatic Chain Detection

The easiest way to use the contract is with the provided hooks that automatically detect the connected chain:

```tsx
import {
  useGigipayContract,
  useGigipayRead,
  useGigipayWrite,
} from "@/hooks/useGigipayContract";

function MyComponent() {
  const { contractConfig, chainId, isSupported } = useGigipayContract();

  // Read from contract
  const { data: vouchers } = useGigipayRead("getSenderVouchers", [userAddress]);

  // Write to contract
  const { write, isPending } = useGigipayWrite();

  const handleCreateVoucher = async () => {
    write(
      "createVoucherBatch",
      [voucherName, claimCodes, amounts, expirationTimes],
      totalValue,
    );
  };

  if (!isSupported) {
    return <div>Please switch to Celo or Base network</div>;
  }

  return <div>Connected to chain {chainId}</div>;
}
```

### Manual Configuration

If you need more control, you can use the configuration functions directly:

```tsx
import {
  getContractConfig,
  getContractAddress,
  isContractDeployed,
} from "@/lib/contracts/gigipay";
import { useAccount, useReadContract } from "wagmi";

function MyComponent() {
  const { chain } = useAccount();

  if (!chain || !isContractDeployed(chain.id)) {
    return <div>Unsupported chain</div>;
  }

  const contractConfig = getContractConfig(chain.id);

  const { data } = useReadContract({
    ...contractConfig,
    functionName: "getSenderVouchers",
    args: [userAddress],
  });

  return <div>Contract: {contractConfig.address}</div>;
}
```

### Token Addresses

Get token addresses for the current chain:

```tsx
import {
  getTokenAddresses,
  getNativeTokenSymbol,
} from "@/lib/contracts/gigipay";
import { useAccount } from "wagmi";

function TokenSelector() {
  const { chain } = useAccount();

  if (!chain) return null;

  const tokens = getTokenAddresses(chain.id);
  const nativeSymbol = getNativeTokenSymbol(chain.id);

  return (
    <select>
      <option value={tokens.USDC}>USDC</option>
      {chain.id === 42220 && (
        <>
          <option value={tokens.cUSD}>cUSD</option>
          <option value={tokens.cEUR}>cEUR</option>
        </>
      )}
      <option value="0x0">{nativeSymbol}</option>
    </select>
  );
}
```

## Available Tokens

### Celo Mainnet

- **CELO** (native)
- **cUSD** - Celo Dollar
- **cEUR** - Celo Euro
- **cREAL** - Celo Real
- **USDC** - USD Coin
- **USDT** - Tether

### Base Mainnet

- **ETH** (native)
- **USDC** - USD Coin (native Base USDC)
- **USDbC** - Bridged USDC from Ethereum

## Helper Functions

### Contract Functions

```typescript
// Get contract address for a chain
const address = getContractAddress(chainId);

// Get full contract config (address + ABI)
const config = getContractConfig(chainId);

// Check if contract is deployed on a chain
const deployed = isContractDeployed(chainId);

// Get all supported chain IDs
const chains = getSupportedChainIds(); // [42220, 8453]
```

### Token Functions

```typescript
// Get all token addresses for a chain
const tokens = getTokenAddresses(chainId);

// Get native token symbol
const symbol = getNativeTokenSymbol(chainId); // 'CELO' or 'ETH'
```

## Migration from Old Config

If you're using the old `celocontract.ts` file, here's how to migrate:

**Old:**

```typescript
import { BATCH_TRANSFER_CONTRACT } from "@/lib/contracts/celocontract";

const { data } = useReadContract({
  ...BATCH_TRANSFER_CONTRACT,
  functionName: "getSenderVouchers",
  args: [address],
});
```

**New:**

```typescript
import { useGigipayRead } from "@/hooks/useGigipayContract";

const { data } = useGigipayRead("getSenderVouchers", [address]);
```

The new hooks automatically handle multi-chain support!

## Network Switching

Users can switch between Celo and Base networks in their wallet. The app will automatically use the correct contract address for the connected chain.

If a user is on an unsupported chain, you can prompt them to switch:

```tsx
import { useGigipayContract } from "@/hooks/useGigipayContract";
import { useSwitchChain } from "wagmi";
import { celo, base } from "wagmi/chains";

function NetworkPrompt() {
  const { isSupported } = useGigipayContract();
  const { switchChain } = useSwitchChain();

  if (isSupported) return null;

  return (
    <div>
      <p>Please switch to a supported network:</p>
      <button onClick={() => switchChain({ chainId: celo.id })}>
        Switch to Celo
      </button>
      <button onClick={() => switchChain({ chainId: base.id })}>
        Switch to Base
      </button>
    </div>
  );
}
```

## Contract Functions

All contract functions work the same across both chains:

- `createVoucherBatch` - Create claim-code payments
- `claimVoucher` - Claim a payment with code
- `refundVoucher` - Refund an unclaimed payment
- `batchTransfer` - Send to multiple addresses
- `getSenderVouchers` - Get user's vouchers
- `getVouchersByName` - Get vouchers by name
- `isVoucherClaimable` - Check if claimable
- `isVoucherRefundable` - Check if refundable

See the contract ABI in `gigipay.ts` for full function signatures.
