"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/products";
import { CURRENCIES } from "@/lib/currency";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  ...CATEGORIES.map((c) => ({ href: `/shop?category=${c.id}`, label: c.label })),
  { href: "/craft", label: "About" },
];

export function Header() {
  const { count, currency, setCurrency, hydrated } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer on navigation, otherwise it covers the new page.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink text-cream/80 px-4 py-2 text-center text-[0.6875rem] tracking-[0.14em] uppercase">
        Free delivery in Nairobi · Worldwide shipping via DHL
      </div>

      <div className="border-sand bg-cream/95 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="-ml-2 p-2 lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <MenuIcon open={menuOpen} />
          </button>

          <Link href="/" className="font-serif text-lg tracking-[0.2em] uppercase">
            Kazoo
            <span className="text-leather">.</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-leather text-[0.8125rem] tracking-wide transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div
              className="border-sand hidden overflow-hidden rounded-full border sm:flex"
              role="group"
              aria-label="Display currency"
            >
              {CURRENCIES.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setCurrency(option.code)}
                  aria-pressed={currency === option.code}
                  className={cn(
                    "px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.1em] transition-colors",
                    currency === option.code
                      ? "bg-ink text-cream"
                      : "text-ink-50 hover:text-ink",
                  )}
                >
                  {option.code}
                </button>
              ))}
            </div>

            <Link
              href="/cart"
              className="hover:text-leather relative p-2 transition-colors"
              aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <BagIcon />
              {/* Suppressed until hydrated so SSR (always 0) and client agree. */}
              {hydrated && count > 0 && (
                <span className="bg-leather text-cream absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] font-semibold">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-sand bg-cream border-t lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-sand/60 hover:bg-ink/5 block border-b px-6 py-3.5 text-sm"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex gap-2 px-6 py-4 sm:hidden">
              {CURRENCIES.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setCurrency(option.code)}
                  aria-pressed={currency === option.code}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-xs font-semibold",
                    currency === option.code
                      ? "bg-ink text-cream border-ink"
                      : "border-sand text-ink-50",
                  )}
                >
                  {option.code}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

function BagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M4 8h16l-1.2 12H5.2L4 8Z" strokeLinejoin="round" />
      <path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M3 7h18" />
          <path d="M3 12h18" />
          <path d="M3 17h18" />
        </>
      )}
    </svg>
  );
}
