import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, PRODUCTS, type Category } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Handcrafted leather bags, footwear, accessories and corporate gifts, made to order in Nairobi.",
};

function isCategory(value: string | undefined): value is Category {
  return CATEGORIES.some((category) => category.id === value);
}

export default async function ShopPage({
  searchParams,
}: {
  // Next 15 hands searchParams over as a promise.
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = isCategory(category) ? category : undefined;

  const products = active
    ? PRODUCTS.filter((product) => product.category === active)
    : PRODUCTS;

  const heading = active
    ? CATEGORIES.find((c) => c.id === active)!
    : {
        label: "Everything we make",
        blurb: "The full range, handcrafted to order in Kenya.",
      };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="eyebrow text-leather">Shop</p>
      <h1 className="mt-3 text-4xl">{heading.label}</h1>
      <p className="text-ink-70 mt-3 max-w-xl leading-relaxed">
        {heading.blurb}
      </p>

      <nav
        aria-label="Filter by category"
        className="border-sand mt-10 flex flex-wrap gap-2 border-b pb-6"
      >
        <FilterPill href="/shop" label="All" active={!active} />
        {CATEGORIES.map((item) => (
          <FilterPill
            key={item.id}
            href={`/shop?category=${item.id}`}
            label={item.label}
            active={active === item.id}
          />
        ))}
      </nav>

      <p className="text-ink-50 mt-6 text-sm">
        {products.length} {products.length === 1 ? "piece" : "pieces"}
      </p>

      <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}

function FilterPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-5 py-2 text-sm transition-colors",
        active
          ? "border-ink bg-ink text-cream"
          : "border-sand hover:border-ink-50",
      )}
    >
      {label}
    </Link>
  );
}
