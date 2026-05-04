# Gigipay Frontend

Next.js 15 web app for the Gigipay protocol. Supports wallet connections, payment vouchers, batch transfers, and Nigerian bill payments (airtime, data, TV, electricity).

## Tech Stack

- **Next.js 15** — App Router, React 19
- **wagmi + viem** — wallet interactions and contract writes
- **RainbowKit** — wallet connection UI (MetaMask, WalletConnect, injected)
- **Privy** — email/phone login with embedded wallets
- **MiniPay** — Celo's mobile wallet (auto-detected via injected provider)
- **Farcaster Mini App SDK** — Farcaster frame support
- **TailwindCSS + shadcn/ui** — styling
- **TanStack Query** — data fetching

## Supported Networks

| Network | Chain ID | Contract                                     |
| ------- | -------- | -------------------------------------------- |
| Celo    | 42220    | `0x70b92a67F391F674aFFfCE3Dd7EB3d99e1f1E9a8` |
| Base    | 8453     | `0xEdc6abb2f1A25A191dAf8B648c1A3686EfFE6Dd6` |

## Project Structure

```
src/
├── app/
│   ├── (app)/
│   │   ├── create-payment/     # Create voucher campaigns
│   │   ├── claim-payment/      # Claim a voucher with a code
│   │   ├── reclaim-payment/    # Refund expired vouchers
│   │   ├── batch-payment/      # Batch send to multiple addresses
│   │   ├── buy-airtime/        # Buy Nigerian airtime with crypto
│   │   └── admin/bills/        # Admin: view balances & withdraw
│   ├── api/                    # Next.js API routes
│   ├── profile/                # User profile page
│   └── layout.tsx              # Root layout with all providers
├── components/
│   ├── Hompage/                # Landing page components
│   ├── create-payment/         # Voucher creation UI
│   ├── batch-payment/          # Batch transfer UI
│   ├── ui/                     # shadcn/ui base components
│   ├── navbar.tsx
│   ├── wallet-provider.tsx     # wagmi + RainbowKit setup
│   ├── privy-provider.tsx      # Privy auth setup
│   ├── paymaster-provider.tsx  # Gasless tx support
│   └── farcaster-provider.tsx  # Farcaster mini app support
├── hooks/
│   ├── useAuth.ts              # Wallet signature auth → JWT
│   ├── usePrivyAuth.ts         # Privy auth → JWT
│   ├── useVouchers.ts          # Voucher write hooks (wagmi)
│   ├── useBatchTransfer.ts     # Batch transfer write hook
│   ├── useAirtime.ts           # Airtime bill payment hook
│   ├── useGigipayContract.ts   # General contract hook
│   ├── useTokenApproval.ts     # ERC20 approval hook
│   ├── useMiniPay.ts           # MiniPay detection
│   ├── useRate.ts              # NGN → token live rate
│   └── useUser.ts              # User profile hook
└── lib/
    ├── api.ts                  # Backend API client (all reads)
    ├── contracts.ts            # Contract addresses (single source of truth)
    ├── app-utils.ts            # Shared utilities
    └── utils.ts                # cn() and helpers
```

## Architecture

Write operations (user signs with their wallet):

```
Frontend → wagmi writeContract → user wallet signs → broadcasts to chain
```

Read operations (no wallet needed):

```
Frontend → fetch → Backend API → viem readContract → chain
```

The contract address is never hardcoded in hooks. It comes from `src/lib/contracts.ts` which reads from env vars.

## Setup

### Prerequisites

- Node.js >= 18
- pnpm

### Install

```bash
pnpm install
```

### Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# WalletConnect — get from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# Privy — get from https://privy.io dashboard
NEXT_PUBLIC_PRIVY_APP_ID=

# Contract addresses (update after each deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS_CELO=0x70b92a67F391F674aFFfCE3Dd7EB3d99e1f1E9a8
NEXT_PUBLIC_CONTRACT_ADDRESS_BASE=0xEdc6abb2f1A25A191dAf8B648c1A3686EfFE6Dd6

# Admin wallets (comma-separated, for /admin/bills access)
NEXT_PUBLIC_ADMIN_ADDRESSES=0xYourWallet
```

### Run

```bash
pnpm dev
```

App runs at `http://localhost:3000`

### Build

```bash
pnpm build
pnpm start
```

## Authentication

Two auth flows are supported, both result in a JWT stored in `localStorage`:

**Wallet (MetaMask, MiniPay, WalletConnect):**

- `useAuth` hook handles the full flow automatically on wallet connect
- Gets nonce from backend → signs message → verifies with backend → stores JWT

**Email/Phone (Privy):**

- `usePrivyAuth` hook syncs Privy session with backend
- Privy access token → backend verifies → stores JWT

MiniPay users are auto-detected via `window.ethereum.isMiniPay` and flagged in the user profile.

## Key Hooks

| Hook                    | What it does                       |
| ----------------------- | ---------------------------------- |
| `useAuth`               | Wallet sign-in, JWT management     |
| `usePrivyAuth`          | Privy sign-in sync                 |
| `useCreateVoucher`      | Create a single voucher            |
| `useCreateVoucherBatch` | Create multiple vouchers in one tx |
| `useClaimVoucher`       | Claim a voucher by name + code     |
| `useRefundVoucher`      | Refund expired vouchers            |
| `useBatchTransfer`      | Send tokens to multiple addresses  |
| `usePayBillAirtime`     | Pay airtime bill on-chain          |
| `useRate`               | Live NGN → token conversion        |
| `useVoucherDetails`     | Fetch voucher data from backend    |
| `useSenderVouchers`     | Fetch all vouchers by sender       |
| `useContractPaused`     | Check if contract is paused        |

## Adding a New Contract Deployment

1. Deploy the contract (see `contracts/README.md`)
2. Update `NEXT_PUBLIC_CONTRACT_ADDRESS_CELO` or `NEXT_PUBLIC_CONTRACT_ADDRESS_BASE` in `.env.local`
3. No code changes needed — all hooks read from `src/lib/contracts.ts`
