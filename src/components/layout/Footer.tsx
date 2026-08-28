import Link from "next/link";
import { CATEGORIES } from "@/lib/products";
import { LogoLockup } from "@/components/ui/Logo";
import { Draft } from "@/components/ui/Draft";
import {
  INSTAGRAM_HANDLE,
  WHATSAPP_DEFAULT_MESSAGE,
  WHATSAPP_DISPLAY,
  whatsappUrl,
} from "@/lib/contact";

/*
 * Footer IA: Shop / Company / Contact.
 *
 * Previously a "Help" column held About, Corporate Gifting and Your Bag. That
 * was wrong three ways: the cart isn't help, Corporate Gifting already appears
 * in the Shop column (it's a catalogue category) so it was listed twice, and
 * "Help" implied support content that doesn't exist yet.
 *
 * Your Bag is dropped entirely — the header carries a persistent cart icon
 * with a live count, so a footer link to it is redundant.
 */
const COMPANY = [{ href: "/craft", label: "About" }];

export function Footer() {
  return (
    <footer className="bg-ink text-cream/70 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <LogoLockup onDark showTagline />
            {/* Taken from the brand's own Instagram bio — not invented. */}
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Handcrafted leather goods. Minimal, timeless, intentional. Made in
              Kenya.
            </p>
            {/* Contact links live in the Contact column only — they were
                previously repeated here too. */}
          </div>

          <FooterColumn
            title="Shop"
            links={CATEGORIES.map((c) => ({
              href: `/shop?category=${c.id}`,
              label: c.label,
            }))}
          />
          <FooterColumn title="Company" links={COMPANY} />

          <div>
            <p className="eyebrow text-cream/50">Contact</p>
            {/* Confirmed channels only. Address and hours are gated below —
                a previous draft invented both. */}
            <div className="mt-4 space-y-2.5 text-sm">
              <p>
                <a
                  href={whatsappUrl(WHATSAPP_DEFAULT_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp {WHATSAPP_DISPLAY}
                </a>
              </p>
              <p>
                <a
                  href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  @{INSTAGRAM_HANDLE}
                </a>
              </p>
            </div>
            <div className="mt-5">
              <Draft needs="footerContact" label="Address, hours, email">
                <p className="text-ink-70 text-sm">
                  Workshop location and opening hours.
                </p>
              </Draft>
            </div>
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
