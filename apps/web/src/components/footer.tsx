import Link from "next/link";
import Image from "next/image";
import { SendHorizontal } from "lucide-react";

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

const socialBtnClass =
  "h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors";

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

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {/* X / Twitter — SVG inline (lucide v1 dropped brand icons) */}
              <a
                href="https://twitter.com/gigipay"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className={socialBtnClass}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/gigipay"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className={socialBtnClass}
              >
                <SendHorizontal className="h-3.5 w-3.5" />
              </a>

              {/* GitHub — SVG inline */}
              <a
                href="https://github.com/Olowodarey/Gigipay"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className={socialBtnClass}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
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
