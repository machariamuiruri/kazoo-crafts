import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductArt } from "@/components/ui/ProductArt";
import { Button } from "@/components/ui/Button";
import { Draft } from "@/components/ui/Draft";
import { WHATSAPP_DEFAULT_MESSAGE, whatsappUrl } from "@/lib/contact";

/*
 * Most of this page is gated behind <Draft>.
 *
 * An earlier version filled it with invented specifics — hide sourcing, stitch
 * counts, a lifetime repair guarantee — none of which came from the business.
 * Those are claims only Kazoo Crafts can make, so each section now carries the
 * questions that need answering instead of placeholder prose, and shows
 * nothing at all to real visitors until they're answered.
 */

export const metadata: Metadata = {
  title: "About",
  description: "About Kazoo Crafts — handcrafted leather goods made in Kenya.",
};

export default function CraftPage() {
  return (
    <div>
      <section className="border-sand border-b">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="eyebrow text-leather">About</p>
            <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
              Minimal. Timeless. Intentional.
            </h1>
            {/* Both sentences below come from the brand's own Instagram bio,
                so they are safe to publish. Everything beyond this is gated. */}
            <p className="text-ink-70 mt-6 leading-relaxed">
              Kazoo Crafts makes handcrafted leather goods in Kenya — footwear,
              baby shoes, bags and small leather pieces, made to order.
            </p>

            <div className="mt-8">
              <Draft needs="aboutStory" label="Founder story / workshop">
                <p className="text-ink-50 text-sm leading-relaxed">
                  This is where the real story goes, in your own words.
                </p>
              </Draft>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/shop" size="lg">
                Shop the collection
              </Button>
              <Button
                href={whatsappUrl(WHATSAPP_DEFAULT_MESSAGE)}
                size="lg"
                variant="outline"
              >
                Ask us anything
              </Button>
            </div>
          </div>
          <div className="bg-sand overflow-hidden rounded-sm">
            <ProductArt finishHex="#6B3A19" name="Kazoo Crafts" size="hero" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 py-16">
          <Draft needs="aboutPrinciples" label="“What we stand for” — 3 principles">
            <div className="grid gap-10 md:grid-cols-3">
              {["Principle one", "Principle two", "Principle three"].map(
                (title) => (
                  <div key={title}>
                    <div className="bg-gold mb-5 h-px w-12" />
                    <h3 className="text-xl">{title}</h3>
                  </div>
                ),
              )}
            </div>
          </Draft>

          <Draft needs="careAndRepair" label="Care, repair and returns policy">
            <div>
              <SectionHeading title="Care and repair" />
            </div>
          </Draft>
        </div>
      </div>

      <section className="bg-surface border-sand border-y">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl">Made to order</h2>
          <p className="text-ink-70 mt-5 leading-relaxed">
            Every piece is made after you order it, so nothing is sitting in a
            warehouse. Lead times are shown on each product page.
          </p>
          <Button href="/shop" size="lg" className="mt-8">
            Shop the collection
          </Button>
        </div>
      </section>
    </div>
  );
}
