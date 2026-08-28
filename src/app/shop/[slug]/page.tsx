import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, getProduct, getRelated } from "@/lib/products";
import { AddToCart } from "@/components/product/AddToCart";
import { ProductCard } from "@/components/product/ProductCard";

/** Pre-renders every product page at build time. */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Not found" };

  return {
    title: product.name,
    description: product.tagline,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-ink-50 mb-10 text-sm">
        <Link href="/shop" className="hover:text-leather transition-colors">
          Shop
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:text-leather capitalize transition-colors"
        >
          {product.category}
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <AddToCart product={product} />

      {related.length > 0 && (
        <section className="border-sand mt-24 border-t pt-14">
          <h2 className="text-2xl">You might also like</h2>
          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
