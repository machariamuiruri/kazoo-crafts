import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductArt } from "@/components/ui/ProductArt";
import { Button } from "@/components/ui/Button";

/*
 * This page is deliberately mostly empty.
 *
 * An earlier draft filled it with invented specifics — hide sourcing, stitch
 * counts, a lifetime repair guarantee — none of which came from the business.
 * Those are claims only Kazoo Crafts can make, so the page now carries clearly
 * marked placeholders instead. Fill them in; don't restore the invented copy.
 */

export const metadata: Metadata = {
  title: "About",
  description:
    "About Kazoo Crafts — handcrafted leather goods made in Kenya.",
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
            <p className="text-ink-70 mt-6 leading-relaxed">
              Kazoo Crafts makes handcrafted leather goods in Kenya — footwear,
              baby shoes, bags and small leather pieces, made to order.
            </p>
            <p className="text-ink-50 mt-6 leading-relaxed italic">
              PLACEHOLDER — this is where the real story goes: who started the
              workshop and when, where you work, who makes the pieces, and what
              you want customers to understand about how you build them. Write
              it in your own words; nothing here should be invented on your
              behalf.
            </p>
          </div>
          <div className="bg-sand overflow-hidden rounded-sm">
            <ProductArt finishHex="#6B3A19" name="Kazoo Crafts" size="hero" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What we stand for"
          title="Three things to fill in"
          blurb="Replace each of these with something true about how you work — materials, construction, or the standard you hold yourself to."
          align="center"
        />
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {["Principle one", "Principle two", "Principle three"].map(
            (title) => (
              <div key={title}>
                <div className="bg-gold mb-5 h-px w-12" />
                <h3 className="text-xl">{title}</h3>
                <p className="text-ink-50 mt-3 leading-relaxed italic">
                  Placeholder — replace with a claim you can stand behind.
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="bg-surface border-sand border-y">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl">Care and repair</h2>
          <p className="text-ink-50 mt-5 leading-relaxed italic">
            PLACEHOLDER — set out your actual care guidance and whether you
            offer repairs, and on what terms. An earlier draft promised
            open-ended lifetime repairs; that was invented, and it is a
            commitment only you can decide to make.
          </p>
          <Button href="/shop" size="lg" className="mt-8">
            Shop the collection
          </Button>
        </div>
      </section>
    </div>
  );
}
