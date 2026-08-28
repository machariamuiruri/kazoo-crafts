import Link from "next/link";
import { CATEGORIES, getFeatured } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductArt } from "@/components/ui/ProductArt";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Draft } from "@/components/ui/Draft";
import { INSTAGRAM_HANDLE, whatsappUrl } from "@/lib/contact";

/** Opening message for the corporate "Request a quote" CTA. */
const CORPORATE_WHATSAPP_MESSAGE =
  "Hi Kazoo Crafts! 👋 I'd like a quote for corporate gifting — branded leather pieces for my team or clients.";

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
        {/* min-w-0 on the columns is load-bearing: grid children default to
            min-width:auto, so the quote's longest word ("Intentional.") sets a
            min-content width that pushes the track past the viewport on mobile
            and causes horizontal scroll. */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-sand min-w-0 overflow-hidden rounded-sm">
            <ProductArt finishHex="#6B3A19" name="Wingtip Brogue" />
          </div>
          <div className="mt-10 grid min-w-0 gap-4">
            <div className="bg-sand min-w-0 overflow-hidden rounded-sm">
              <ProductArt finishHex="#B87333" name="Leather Sandal" />
            </div>
            {/* This tile used to repeat "Minimal. Timeless. Intentional."
                verbatim from the <h1> a few hundred pixels above it — a
                duplicate render, not a stamp treatment. Now points at
                Instagram, where the real product photography lives. */}
            <a
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ink text-cream hover:bg-leather flex min-w-0 flex-col justify-center rounded-sm p-6 transition-colors"
            >
              <p className="font-serif text-xl leading-snug break-words">
                @{INSTAGRAM_HANDLE}
              </p>
              <p className="text-cream/60 mt-3 text-xs tracking-wide uppercase">
                See our work on Instagram
              </p>
            </a>
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
      <Draft needs="processSteps" label="“How each pair is made” — process steps">
        <SectionHeading
          eyebrow="Our craft"
          title="How each pair is made"
          align="center"
        />
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {["01", "02", "03"].map((step) => (
            <li key={step}>
              <span className="font-serif text-gold text-4xl">{step}</span>
            </li>
          ))}
        </ol>
      </Draft>
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
          {/* States only what's confirmed: the product types, and the MOQs
              Frank verified (Folio 25, Tag Set 50). Branding method and lead
              times are still outstanding — see the Draft block below. */}
          <p className="text-cream/70 mt-5 max-w-xl leading-relaxed">
            Leather folios and tag sets for teams, clients and conferences,
            carrying your branding. Minimum order from 25 pieces.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/shop?category=corporate" size="lg" variant="accent">
              See gifting range
            </Button>
            <Button
              href={whatsappUrl(CORPORATE_WHATSAPP_MESSAGE)}
              size="lg"
              variant="outline"
              className="border-cream/30 text-cream hover:border-cream hover:bg-cream/10"
            >
              Request a quote
            </Button>
          </div>

          <div className="mt-8">
            <Draft needs="corporateTerms" label="Corporate gifting terms">
              <p className="text-ink-70 text-sm">
                Branding method, lead time, setup costs and packaging.
              </p>
            </Draft>
          </div>
        </div>
        <div className="bg-cream/5 overflow-hidden rounded-sm">
          <ProductArt finishHex="#1A1816" name="Executive Folio" size="hero" />
        </div>
      </div>
    </section>
  );
}
