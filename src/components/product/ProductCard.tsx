import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductImage } from "@/components/product/ProductImage";
import { Price } from "@/components/ui/Price";

export function ProductCard({ product }: { product: Product }) {
  const onSale =
    product.compareAtKes !== undefined && product.compareAtKes > product.priceKes;

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-sm bg-sand">
        <ProductImage
          product={product}
          finishHex={product.finishes[0].hex}
          className="transition-transform duration-700 ease-[var(--ease-craft)] group-hover:scale-[1.04]"
        />
        {onSale && (
          <span className="eyebrow absolute top-3 left-3 rounded-full bg-cream px-3 py-1 text-ink">
            Sale
          </span>
        )}
        {product.moq !== undefined && (
          <span className="eyebrow absolute top-3 left-3 rounded-full bg-ink px-3 py-1 text-cream">
            MOQ {product.moq}
          </span>
        )}
      </div>

      <div className="pt-4">
        <h3 className="text-base font-medium transition-colors group-hover:text-leather">
          {product.name}
        </h3>
        <p className="text-ink-50 mt-1 line-clamp-1 text-sm">{product.tagline}</p>
        <Price
          amountKes={product.priceKes}
          compareAtKes={product.compareAtKes}
          className="mt-2 text-sm font-medium"
        />
      </div>
    </Link>
  );
}
