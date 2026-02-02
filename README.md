

# GigiPay

**GigiPay** is a **multichain payment protocol** designed to make on-chain transfers **faster, cheaper, and more inclusive**.
It currently supports **Celo and Base**, with a flexible architecture that allows easy expansion to additional chains.

With GigiPay, users can send funds to **multiple wallets in a single transaction**, significantly reducing gas costs and simplifying large-scale payouts across supported networks.

GigiPay also introduces **claim-code payments**, allowing users to send crypto **without needing the recipient’s wallet address**.
Instead, a secure claim code or shareable link is generated, which the recipient can redeem at any time — even if they don’t yet have a wallet.

---

## Key Features

* **Multichain Support (Celo & Base):**
  Execute payments seamlessly on **Celo** and **Base**, choosing the network that best fits your use case.

* **CSV Batch Uploads:**
  Organizations can upload wallet addresses to execute mass payments effortlessly across supported chains.

* **Giveaway & Rewards Dashboard:**
  Track who has claimed rewards, monitor payouts per chain, and reclaim unclaimed funds after expiration.

* **Claim-Code Payments:**
  Send funds using a secure code or link — no wallet address required at the time of sending.

* **Optional Gasless Redemption:**
  First-time users can redeem claim codes without paying gas, lowering onboarding friction.

* **Wallet Abstraction via Gmail:**
  New users can create a wallet using just their Gmail, avoiding seed phrase complexity.

* **Future Off-Ramp Integration:**
  Planned API integrations enabling stablecoins like **cUSD** and **USDC** to be converted into local currencies such as **Naira**.

---

## Built for Multichain Payments

GigiPay is built with a **chain-agnostic architecture**, enabling fast, low-cost payments across multiple ecosystems.

* **Celo:**
  Mobile-first, carbon-negative blockchain with stablecoins optimized for everyday payments.

* **Base:**
  A secure, low-cost Ethereum L2 designed for scalable consumer and developer applications.

This multichain approach allows GigiPay to serve **global users, DAOs, startups, and organizations** with diverse payment needs.

---

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

---

## Project Structure

This is a monorepo managed by **Turborepo** with the following structure:

* `apps/web` — Next.js application with embedded UI components and utilities


---

## Learn More

* [Next.js Documentation](https://nextjs.org/docs)
* [Celo Documentation](https://docs.celo.org/)
* [Base Documentation](https://docs.base.org/)
* [Turborepo Documentation](https://turbo.build/repo/docs)
* [shadcn/ui Documentation](https://ui.shadcn.com/)

