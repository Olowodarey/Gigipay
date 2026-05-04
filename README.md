# Gigipay

A multichain crypto payment protocol on **Celo** and **Base**. Send to multiple wallets in one transaction, create claim-code vouchers, and pay Nigerian utility bills (airtime, data, TV, electricity) with crypto.

## What you can do

- **Batch Transfer** — send tokens to hundreds of addresses in a single transaction
- **Payment Vouchers** — send crypto without knowing the recipient's wallet address; they claim with a secret code
- **Bill Payments** — buy airtime, data bundles, pay DSTV/GOtv, pay electricity bills using any supported token
- **Gmail Login** — recipients can sign in with Google; Privy creates an embedded wallet automatically

## Monorepo Structure

```
Gigipay/
├── apps/
│   └── web/          # Next.js frontend
Gigipay-backend/       # NestJS API server
contracts/             # Solidity smart contracts (Foundry)
```

Each folder has its own README with full setup instructions:

- [contracts/README.md](../contracts/README.md) — smart contract docs, deployment, tests
- [Gigipay-backend/README.md](../Gigipay-backend/README.md) — backend API, auth, bill fulfilment
- [apps/web/README.md](apps/web/README.md) — frontend setup, hooks, architecture

## Deployed Contracts

| Network      | Address                                      |
| ------------ | -------------------------------------------- |
| Celo Mainnet | `0x70b92a67F391F674aFFfCE3Dd7EB3d99e1f1E9a8` |
| Base Mainnet | `0xEdc6abb2f1A25A191dAf8B648c1A3686EfFE6Dd6` |

## Quick Start

### Frontend (monorepo)

```bash
pnpm install
pnpm dev
```

Runs at `http://localhost:3000`

### Backend

```bash
cd Gigipay-backend
pnpm install
cp .env.example .env   # fill in your values
pnpm start:dev
```

Runs at `http://localhost:3001`  
Swagger docs at `http://localhost:3001/api/docs`

### Contracts

```bash
cd contracts
forge build
forge test
```

## How it works

```
User (browser wallet)
  │
  ├── write txs (create voucher, claim, batch transfer, pay bill)
  │     └── wagmi writeContract → user signs → broadcasts to chain
  │
  └── read data (voucher state, balances, order status)
        └── fetch → Backend API → viem readContract → chain
```

For bill payments specifically:

```
1. User calls payBill() on contract (wallet signs)
2. Contract holds crypto, emits BillPaymentInitiated event
3. Backend listener picks up event
4. Backend calls ClubKonnect API → airtime/data/TV/electricity delivered
5. Order status stored in DB, polled by frontend
```

## Supported Wallets

- MetaMask
- WalletConnect (any compatible wallet)
- MiniPay (Celo mobile wallet — auto-detected)
- Privy embedded wallet (email/phone/Google login)

## Tech Stack

| Layer           | Tech                                                    |
| --------------- | ------------------------------------------------------- |
| Smart Contracts | Solidity 0.8.27, Foundry, OpenZeppelin Upgradeable      |
| Backend         | NestJS, TypeORM, PostgreSQL, viem, Privy                |
| Frontend        | Next.js 15, wagmi, viem, RainbowKit, Privy, TailwindCSS |
| Auth            | SIWE wallet signatures + Privy (email/phone) → JWT      |
| Bill API        | ClubKonnect (airtime, data, TV, electricity)            |

## Requirements

- Node.js >= 18
- pnpm >= 9
- PostgreSQL (for backend)
- Foundry (for contracts)
