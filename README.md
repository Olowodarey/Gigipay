# GiGipay

GigiPay is a Celo-powered payment protocol designed to make on-chain transfers faster, cheaper, and more inclusive. With GigiPay, users can send funds to multiple wallets in a single transaction, significantly reducing gas costs and simplifying large-scale payouts.
GigiPay also introduces claim-code payments, allowing users to send crypto without needing the recipient’s wallet address. Instead, a secure claim code or shareable link is generated, which the recipient can redeem at any time — even if they don’t yet have a wallet.

Other key features include:
    • CSV batch uploads: Organizations can upload wallet addresses to execute mass payments effortlessly.
    • Giveaway and rewards dashboard: Track who has claimed rewards and reclaim unclaimed funds after expiration.
    • Optional gasless redemption: Users can redeem claim codes without paying gas, lowering barriers for first-time users.
    • Wallet abstraction via Gmail: New users can create a wallet using just their Gmail, avoiding seed phrase complexity.
    • Future off-ramp integration: Plans to integrate APIs enabling stablecoins like cUSD to be converted into local currencies such as Naira.
Built on Celo’s mobile-first, carbon-negative blockchain, and leveraging stablecoins for price stability, GigiPay delivers a seamless and inclusive payment experience for communities, DAOs, businesses, and organizations managing bulk transfers or reward campaigns.
## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

This is a monorepo managed by Turborepo with the following structure:

- `apps/web` - Next.js application with embedded UI components and utilities

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Lint all packages and apps
- `pnpm type-check` - Run TypeScript type checking

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Monorepo**: Turborepo
- **Package Manager**: NPM

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Celo Documentation](https://docs.celo.org/)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
