"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, Gift, Sparkles, RefreshCw } from "lucide-react";
import { useAccount } from "wagmi";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WalletConnectButton } from "@/components/connect-button";

/** Wallet addresses that have access to the admin section. */
const ADMIN_ADDRESSES = (process.env.NEXT_PUBLIC_ADMIN_ADDRESSES || "")
  .split(",")
  .map((a) => a.trim().toLowerCase())
  .filter(Boolean);

/** Voucher sub-links shown in the dropdown */
const voucherLinks = [
  {
    name: "Create Voucher",
    href: "/create-payment",
    icon: Sparkles,
    description: "Create on-chain voucher batches",
  },
  {
    name: "Claim Voucher",
    href: "/claim-payment",
    icon: Gift,
    description: "Claim a voucher with your code",
  },
  {
    name: "Reclaim Voucher",
    href: "/reclaim-payment",
    icon: RefreshCw,
    description: "Recover funds from expired vouchers",
  },
];

/** Voucher-related paths — used to highlight the dropdown trigger */
const voucherPaths = voucherLinks.map((l) => l.href).concat(["/voucher"]);

const baseNavLinks = [
  { name: "Home", href: "/" },
  { name: "Batch Payment", href: "/batch-payment" },
  { name: "Buy Airtime", href: "/buy-airtime" },
  { name: "Swap", href: "/swap" },
];

const adminLink = { name: "Admin", href: "/admin/bills" };

/** Dropdown for voucher-related actions */
function VoucherDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = voucherPaths.some((p) => pathname.startsWith(p));

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-xs lg:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
          isActive
            ? "text-foreground border-b-2 border-primary pb-0.5"
            : "text-foreground/70"
        }`}
      >
        Voucher
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-xl border bg-background shadow-lg ring-1 ring-black/5 z-50 overflow-hidden">
          {/* Hub link */}
          <Link
            href="/voucher"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 border-b"
          >
            <Gift className="w-3.5 h-3.5" />
            Voucher Hub
          </Link>
          {voucherLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                  pathname === link.href ? "bg-muted/50" : ""
                }`}
              >
                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none mb-1">
                    {link.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { address } = useAccount();

  const isAdmin = !!address && ADMIN_ADDRESSES.includes(address.toLowerCase());
  const navLinks = isAdmin ? [...baseNavLinks, adminLink] : baseNavLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex items-center gap-2 mb-8">
                <Image
                  src="/newlogo-cropped.png"
                  alt="Gigipay Logo"
                  width={250}
                  height={250}
                  className="h-50 w-auto"
                />
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-muted hover:text-primary ${
                      pathname === link.href
                        ? "bg-muted text-foreground"
                        : "text-foreground/70"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Voucher section in mobile */}
                <div className="mt-2 pt-2 border-t">
                  <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Voucher
                  </p>
                  <Link
                    href="/voucher"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-muted hover:text-primary ${
                      pathname === "/voucher"
                        ? "bg-muted text-foreground"
                        : "text-foreground/70"
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    Voucher Hub
                  </Link>
                  {voucherLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-colors hover:bg-muted hover:text-primary ${
                          pathname === link.href
                            ? "bg-muted text-foreground"
                            : "text-foreground/70"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.name}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <WalletConnectButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/newlogo-cropped.png"
              alt="Gigipay Logo"
              width={250}
              height={250}
              className="h-100 w-auto"
            />
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              className={`flex items-center gap-1.5 text-xs lg:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                pathname === link.href
                  ? "text-foreground border-b-2 border-primary pb-0.5"
                  : "text-foreground/70"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Voucher dropdown */}
          <VoucherDropdown pathname={pathname} />
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
