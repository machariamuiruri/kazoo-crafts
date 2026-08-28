import Link from "next/link";
import { CATEGORIES, getFeatured } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductArt } from "@/components/ui/ProductArt";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

/*
 * Copy note.
 *
 * The hero wording is taken from the brand's own Instagram bio
 * (@26_kazoocraft.ke): "HANDCRAFTED LEATHER GOODS · minimal.timeless.
 * intentional · KENYA · DM to order." Everything marked PLACEHOLDER below is
 * scaffolding and makes no factual claim — replace it with real copy before
 * launch. Do not reintroduce specifics (materials, process, guarantees) that
 * haven't been confirmed by the business.
 */

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryStrip />
      <Featured />
      <CraftStory />
      <CorporateBand />
    </>
  );
}

function Hero() {
  return (
    <section className="border-sand border-b">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-24 lg:px-8">
        <div>
          <p className="eyebrow text-leather">Handcrafted in Kenya</p>
          <h1 className="mt-4 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            Minimal.
            <br />
            Timeless.
            <br />
            Intentional.
          </h1>
          <p className="text-ink-70 mt-6 max-w-md text-lg leading-relaxed">
            Handcrafted leather goods — shoes, boots, sandals and small leather
            pieces, made to order in Kenya.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/shop" size="lg">
              Shop the collection
            </Button>
            <Button href="/craft" size="lg" variant="outline">
              About us
            </Button>
          </div>
          <dl className="border-sand mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-8">
            {[
              { value: "Handcrafted", label: "Made by hand" },
              { value: "Kenya", label: "Made locally" },
              { value: "M-PESA", label: "& card accepted" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-serif text-2xl">{stat.value}</dt>
                <dd className="text-ink-50 mt-1 text-xs leading-snug">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Generated artwork standing in for real photography. */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-sand overflow-hidden rounded-sm">
            <ProductArt finishHex="#6B3A19" name="Wingtip Brogue" />
          </div>
          <div className="mt-10 grid gap-4">
            <div className="bg-sand overflow-hidden rounded-sm">
              <ProductArt finishHex="#B87333" name="Leather Sandal" />
            </div>
            <div className="bg-ink text-cream flex flex-col justify-center rounded-sm p-6">
              <p className="font-serif text-2xl leading-snug">
                Minimal. Timeless. Intentional.
              </p>
              <p className="text-cream/60 mt-3 text-xs tracking-wide uppercase">
                @26_kazoocraft.ke
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Collections"
        title="What we make"
        blurb="Footwear first, plus a small range of bags, accessories and gifting."
        align="center"
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.id}`}
            className="group border-sand hover:border-leather rounded-sm border p-6 transition-colors"
          >
            <h3 className="group-hover:text-leather text-xl transition-colors">
              {category.label}
            </h3>
            <p className="text-ink-70 mt-2 text-sm leading-relaxed">
              {category.blurb}
            </p>
            <span className="text-leather mt-5 inline-block text-xs tracking-[0.1em] uppercase">
              Browse →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Featured() {
  const featured = getFeatured();

  return (
    <section className="bg-surface border-sand border-y">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Selected" title="Featured pieces" />
          <Link
            href="/shop"
            className="text-leather hover:text-clay text-sm tracking-wide underline underline-offset-4 transition-colors"
          >
            View everything
          </Link>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CraftStory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Our craft"
        title="How each pair is made"
        blurb="PLACEHOLDER — describe your actual process here. The three steps below are empty scaffolding, not claims about how you work."
        align="center"
      />
      <ol className="mt-14 grid gap-10 md:grid-cols-3">
        {[
          { step: "01", title: "Step one" },
          { step: "02", title: "Step two" },
          { step: "03", title: "Step three" },
        ].map((item) => (
          <li key={item.step}>
            <span className="font-serif text-gold text-4xl">{item.step}</span>
            <h3 className="mt-3 text-xl">{item.title}</h3>
            <p className="text-ink-50 mt-3 leading-relaxed italic">
              Placeholder — replace with a real description of this stage.
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CorporateBand() {
  return (
    <section className="bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div>
          <p className="eyebrow text-gold">Corporate gifting</p>
          <h2 className="text-cream mt-4 text-3xl sm:text-4xl">
            Leather gifts for teams and clients
          </h2>
          <p className="text-cream/70 mt-5 max-w-xl leading-relaxed">
            Folios and tag sets in leather, carrying your branding. PLACEHOLDER
            — confirm the branding method, minimum order quantities and lead
            times before publishing this section.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/shop?category=corporate" size="lg" variant="accent">
              See gifting range
            </Button>
            <Button
              href="https://instagram.com/26_kazoocraft.ke"
              size="lg"
              variant="outline"
              className="border-cream/30 text-cream hover:border-cream hover:bg-cream/10"
            >
              Enquire on Instagram
            </Button>
          </div>
        </div>
        <div className="bg-cream/5 overflow-hidden rounded-sm">
          <ProductArt finishHex="#1A1816" name="Executive Folio" size="hero" />
        </div>
      </div>
    </section>
  );
}
