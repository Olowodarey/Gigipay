"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // ── General ──────────────────────────────────────────────────────────────
  {
    category: "General",
    question: "What is Gigipay?",
    answer:
      "Gigipay is an on-chain payment platform built on Celo and Base. It lets you send crypto to multiple people at once, create claimable vouchers, buy Nigerian airtime with crypto, and swap tokens — all without needing a centralised intermediary.",
  },
  {
    category: "General",
    question: "Which networks does Gigipay support?",
    answer:
      "Gigipay currently supports Celo Mainnet and Base Mainnet. On Celo you can pay with CELO, cUSD, cEUR, USDC, and USDT. On Base you can pay with ETH, USDC, and USDbC.",
  },
  {
    category: "General",
    question: "Do I need to create an account?",
    answer:
      "No account needed. You just connect your wallet (via Privy, MetaMask, or any WalletConnect-compatible wallet) and you're ready to go. Your wallet address is your identity on Gigipay.",
  },

  // ── Batch Payment ─────────────────────────────────────────────────────────
  {
    category: "Batch Payment",
    question: "What is Batch Payment?",
    answer:
      "Batch Payment lets you send crypto to dozens or hundreds of wallet addresses in a single transaction. Instead of sending one-by-one, you upload a list of recipients and amounts, review the total, approve once (for ERC-20 tokens), and the smart contract distributes everything atomically.",
  },
  {
    category: "Batch Payment",
    question: "How do I add recipients for a batch payment?",
    answer:
      "You can type addresses and amounts manually, or upload a CSV file. The CSV format is simple: one row per recipient with columns for wallet address and amount. You can download a template directly from the batch payment page.",
  },
  {
    category: "Batch Payment",
    question: "Is there a limit on how many recipients I can include?",
    answer:
      "There is no hard limit set by Gigipay, but very large batches may hit block gas limits on-chain. We recommend keeping batches under 200 recipients per transaction for reliability. You can always split a large list into multiple batches.",
  },
  {
    category: "Batch Payment",
    question: "What happens if one transfer in a batch fails?",
    answer:
      "Batch payments are atomic — if any single transfer in the batch fails, the entire transaction reverts and no funds leave your wallet. This protects you from partial sends.",
  },

  // ── Vouchers ──────────────────────────────────────────────────────────────
  {
    category: "Vouchers",
    question: "What are Gigipay Vouchers?",
    answer:
      "Vouchers are on-chain payment links secured by a claim code. You lock crypto into a smart contract and share a unique code with each recipient. They enter the code on the Claim page to receive their funds — no wallet required to receive a code, only to claim it.",
  },
  {
    category: "Vouchers",
    question: "How do I create a voucher batch?",
    answer:
      "Go to Voucher → Create Voucher. Enter a campaign name, total prize pool, expiry time, and the token you want to use. Then add each winner with their unique claim code and amount. On the next step you approve the token spend (for ERC-20s) and the contract locks all funds at once.",
  },
  {
    category: "Vouchers",
    question: "Can vouchers expire?",
    answer:
      "Yes. When creating vouchers you can set an expiry in hours, days, or weeks — or choose 'Never expire'. Once a voucher expires it can no longer be claimed, but you (the creator) can reclaim the funds.",
  },
  {
    category: "Vouchers",
    question: "What is Reclaim and when should I use it?",
    answer:
      "Reclaim lets you recover funds from vouchers that were never claimed or have expired. Go to Voucher → Reclaim Voucher, enter your campaign name, and the contract will refund all unclaimed vouchers in that batch back to your wallet in one transaction.",
  },
  {
    category: "Vouchers",
    question: "Is the claim code stored on-chain?",
    answer:
      "Only a keccak256 hash of the claim code is stored on-chain — the raw code is never exposed publicly. This means recipients must know the exact code to claim their voucher.",
  },

  // ── Airtime ───────────────────────────────────────────────────────────────
  {
    category: "Airtime",
    question: "How does Buy Airtime work?",
    answer:
      "You enter a Nigerian phone number, select the network (MTN, GLO, 9mobile, or Airtel), and enter the airtime amount in Naira. Gigipay fetches a live exchange rate, you pay the equivalent in crypto, and the airtime is delivered to the phone number within seconds via our fulfilment partner.",
  },
  {
    category: "Airtime",
    question: "What is Bulk Airtime?",
    answer:
      "Bulk Airtime lets you top up multiple Nigerian numbers in one session. Add recipients manually or upload a CSV with phone, network, and amount columns. Gigipay processes each transaction sequentially, showing you live status per recipient as they confirm on-chain.",
  },
  {
    category: "Airtime",
    question: "Which Nigerian networks are supported?",
    answer:
      "MTN, GLO, 9mobile (Etisalat), and Airtel are all supported. Select the correct network for the number you're topping up — sending to the wrong network will result in a failed delivery.",
  },
  {
    category: "Airtime",
    question: "What is the minimum and maximum airtime amount?",
    answer:
      "The minimum is ₦50 and the maximum is ₦200,000 per transaction. For bulk sends each individual recipient follows the same limits.",
  },
  {
    category: "Airtime",
    question: "Where does the exchange rate come from?",
    answer:
      "Rates are fetched in real time from CoinGecko via the Gigipay backend. The rate shown at the time you submit is the rate used for your transaction.",
  },

  // ── Security ──────────────────────────────────────────────────────────────
  {
    category: "Security",
    question: "Are the smart contracts audited?",
    answer:
      "The Gigipay contracts are upgradeable proxies built with OpenZeppelin's battle-tested libraries. A formal audit is in progress. You can review the source code directly on the block explorer for full transparency.",
  },
  {
    category: "Security",
    question: "Does Gigipay ever hold my funds?",
    answer:
      "For batch payments and airtime, funds move directly through the smart contract in the same transaction — Gigipay never custodies them. For vouchers, funds are locked in the contract until claimed or reclaimed by you.",
  },
  {
    category: "Security",
    question: "What wallets are supported?",
    answer:
      "Any WalletConnect-compatible wallet works, including MetaMask, Rainbow, Coinbase Wallet, and MiniPay. Gigipay also supports Privy embedded wallets so users can log in with email or social accounts without needing a separate wallet app.",
  },
];

const categories = Array.from(new Set(faqs.map((f) => f.category)));

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("General");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter((f) => f.category === activeCategory);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-20 px-4" id="faq">
      <div className="container max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about Gigipay's features.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-foreground/70 border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border bg-background transition-shadow ${
                  isOpen ? "shadow-sm" : ""
                }`}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-sm leading-snug">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
