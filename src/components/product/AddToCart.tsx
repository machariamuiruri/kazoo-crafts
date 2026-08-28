"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { ProductArt } from "@/components/ui/ProductArt";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/utils";

/**
 * Owns finish/size/quantity selection for a product.
 *
 * Also renders the artwork, because the preview has to react to the selected
 * finish — keeping it in the server page would mean lifting this state up
 * into a client wrapper anyway.
 */
export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useStore();
  const [finish, setFinish] = useState(product.finishes[0]);
  const [size, setSize] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(product.moq ?? 1);
  const [justAdded, setJustAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const needsSize = Boolean(product.sizes?.length);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  function handleAdd() {
    if (needsSize && !size) {
      setSizeError(true);
      return;
    }
    addItem({
      slug: product.slug,
      name: product.name,
      priceKes: product.priceKes,
      finish: finish.name,
      finishHex: finish.hex,
      size,
      qty,
    });
    setJustAdded(true);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="bg-sand overflow-hidden rounded-sm">
        <ProductArt finishHex={finish.hex} name={product.name} size="hero" />
      </div>

      <div>
        <p className="eyebrow text-leather">{product.category}</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">{product.name}</h1>
        <p className="text-ink-70 mt-3 text-lg">{product.tagline}</p>

        <Price
          amountKes={product.priceKes}
          compareAtKes={product.compareAtKes}
          className="mt-6 text-2xl font-medium"
        />

        <p className="text-ink-70 mt-6 leading-relaxed">{product.description}</p>

        {/* Finish */}
        <fieldset className="mt-8">
          <legend className="eyebrow text-ink-50">
            Finish — <span className="text-ink normal-case">{finish.name}</span>
          </legend>
          <div className="mt-3 flex gap-3">
            {product.finishes.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => setFinish(option)}
                aria-label={option.name}
                aria-pressed={finish.name === option.name}
                className={cn(
                  "h-9 w-9 rounded-full transition-all",
                  finish.name === option.name
                    ? "ring-ink ring-2 ring-offset-2 ring-offset-cream"
                    : "ring-sand hover:ring-ink-50 ring-1",
                )}
                style={{ backgroundColor: option.hex }}
              />
            ))}
          </div>
        </fieldset>

        {/* Size */}
        {needsSize && (
          <fieldset className="mt-8">
            <legend className="eyebrow text-ink-50">Size</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes!.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSize(option);
                    setSizeError(false);
                  }}
                  aria-pressed={size === option}
                  className={cn(
                    "min-w-12 rounded-full border px-4 py-2 text-sm transition-colors",
                    size === option
                      ? "border-ink bg-ink text-cream"
                      : "border-sand hover:border-ink-50",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            {sizeError && (
              <p role="alert" className="text-clay mt-2 text-sm">
                Choose a size to continue.
              </p>
            )}
          </fieldset>
        )}

        {/* Quantity */}
        <div className="mt-8 flex items-center gap-4">
          <span className="eyebrow text-ink-50">Qty</span>
          <div className="border-sand flex items-center rounded-full border">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(product.moq ?? 1, q - 1))}
              className="hover:text-leather px-4 py-2 text-lg leading-none"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="hover:text-leather px-4 py-2 text-lg leading-none"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          {product.moq !== undefined && (
            <span className="text-ink-50 text-xs">
              Minimum order {product.moq}
            </span>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={handleAdd} variant={justAdded ? "accent" : "primary"}>
            {justAdded ? "Added to bag ✓" : "Add to bag"}
          </Button>
          <Button size="lg" variant="outline" href="/cart">
            View bag
          </Button>
        </div>

        <p className="text-ink-50 mt-5 text-sm">
          Made to order — ships in {product.leadTimeDays} working days.
        </p>

        <ul className="border-sand text-ink-70 mt-8 space-y-2 border-t pt-8 text-sm">
          {product.details.map((detail) => (
            <li key={detail} className="flex gap-3">
              <span className="text-gold" aria-hidden="true">
                —
              </span>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
