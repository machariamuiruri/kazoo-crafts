import type { Metadata } from "next";
// Self-hosted variable fonts. These ship from our own domain, so no visitor IP
// reaches Google — hotlinking Google Fonts has been ruled a GDPR breach in the
// EU, and this storefront sells into the EU. Variable faces cover every weight
// we use (Playfair 400–900, Jakarta 200–800) in one file each, and the
// unicode-range subsetting means only Latin is actually downloaded.
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

export const metadata: Metadata = {
  title: {
    default: "Kazoo Crafts — Handcrafted Leather Goods, Made in Nairobi",
    template: "%s · Kazoo Crafts",
  },
  description:
    "Handcrafted luxury leather bags, footwear and accessories made in Nairobi. " +
    "Pay by M-PESA within Kenya, or by card worldwide.",
  openGraph: {
    title: "Kazoo Crafts",
    description: "Handcrafted luxury leather goods, made in Nairobi.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </StoreProvider>
      </body>
    </html>
  );
}
