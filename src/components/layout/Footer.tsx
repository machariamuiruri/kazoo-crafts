import Link from "next/link";
import { CATEGORIES } from "@/lib/products";

const HELP = [
  { href: "/craft", label: "About" },
  { href: "/shop?category=corporate", label: "Corporate Gifting" },
  { href: "/cart", label: "Your Bag" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-cream/70 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="text-cream font-serif text-xl tracking-[0.2em] uppercase">
              Kazoo<span className="text-gold">.</span>
            </p>
            {/* Taken from the brand's own Instagram bio — not invented. */}
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Handcrafted leather goods. Minimal, timeless, intentional. Made in
              Kenya.
            </p>
            <p className="mt-6 text-sm">
              <a
                href="https://instagram.com/26_kazoocraft.ke"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                @26_kazoocraft.ke
              </a>
            </p>
          </div>

          <FooterColumn
            title="Shop"
            links={CATEGORIES.map((c) => ({
              href: `/shop?category=${c.id}`,
              label: c.label,
            }))}
          />
          <FooterColumn title="Help" links={HELP} />

          <div>
            <p className="eyebrow text-cream/50">Contact</p>
            {/* PLACEHOLDER — a previous draft invented a workshop address and
                opening hours. Replace with real contact details. */}
            <address className="text-cream/50 mt-4 text-sm leading-relaxed italic">
              Placeholder — add your real location, opening hours and contact
              email here.
            </address>
          </div>
        </div>

        <div className="border-cream/10 mt-14 flex flex-col gap-4 border-t pt-8 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kazoo Crafts. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>M-PESA</span>
            <span aria-hidden="true" className="text-cream/25">
              ·
            </span>
            <span>Visa</span>
            <span aria-hidden="true" className="text-cream/25">
              ·
            </span>
            <span>Mastercard</span>
            <span aria-hidden="true" className="text-cream/25">
              ·
            </span>
            <span>PayPal</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="eyebrow text-cream/50">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-gold transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
