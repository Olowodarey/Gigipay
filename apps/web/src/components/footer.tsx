import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, SendHorizontal } from "lucide-react";

const links = {
  Product: [
    { name: "Batch Payment", href: "/batch-payment" },
    { name: "Vouchers", href: "/voucher" },
    { name: "Buy Airtime", href: "/buy-airtime" },
    { name: "Bulk Airtime", href: "/bulk-airtime" },
    { name: "Swap", href: "/swap" },
  ],
  Vouchers: [
    { name: "Create Voucher", href: "/create-payment" },
    { name: "Claim Voucher", href: "/claim-payment" },
    { name: "Reclaim Voucher", href: "/reclaim-payment" },
  ],
  Resources: [
    { name: "FAQ", href: "/#faq" },
    { name: "Profile", href: "/profile" },
  ],
};

const YEAR = new Date().getFullYear();

/** Site-wide footer with nav links, social icons, and copyright. */
export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container max-w-screen-2xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link
              href="/"
              className="inline-block hover:opacity-80 transition-opacity"
            >
              <Image
                src="/newlogo-cropped.png"
                alt="Gigipay"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              On-chain payments made simple. Send crypto to anyone, run
              giveaways, and top up airtime — all on Celo and Base.
            </p>

            {/* Social icons — inlined to avoid undefined component refs */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://twitter.com/gigipay"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://t.me/gigipay"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <SendHorizontal className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://github.com/Olowodarey/Gigipay"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {group}
              </h3>
              <ul className="space-y-2">
                {items.map(({ name, href }) => (
                  <li key={name}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {YEAR} Gigipay. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built on</span>
            <a
              href="https://celo.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              Celo
            </a>
            <span>&amp;</span>
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              Base
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
