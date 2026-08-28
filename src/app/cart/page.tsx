"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { ProductArt } from "@/components/ui/ProductArt";

export default function CartPage() {
  const { items, subtotalKes, currency, setQty, removeItem, keyOf, hydrated } =
    useStore();

  // Until localStorage is read, the cart is unknown — showing the empty state
  // here would flash "your bag is empty" at someone who has items.
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-ink-50 text-sm">Loading your bag…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl">Your bag is empty</h1>
        <p className="text-ink-70 mt-4 leading-relaxed">
          Have a look at the collection to get started.
        </p>
        <Button href="/shop" size="lg" className="mt-8">
          Shop the collection
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl">Your bag</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <ul className="border-sand divide-sand divide-y border-t border-b">
          {items.map((item) => {
            const key = keyOf(item);
            return (
              <li key={key} className="flex gap-5 py-6">
                <Link
                  href={`/shop/${item.slug}`}
                  className="bg-sand w-24 shrink-0 overflow-hidden rounded-sm"
                >
                  <ProductArt finishHex={item.finishHex} name={item.name} />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <Link
                        href={`/shop/${item.slug}`}
                        className="hover:text-leather font-medium transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-ink-50 mt-1 text-sm">
                        {item.finish}
                        {item.size && ` · Size ${item.size}`}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.priceKes * item.qty, currency)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center gap-5 pt-4">
                    <div className="border-sand flex items-center rounded-full border">
                      <button
                        type="button"
                        onClick={() => setQty(key, item.qty - 1)}
                        className="hover:text-leather px-3 py-1.5 leading-none"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty(key, item.qty + 1)}
                        className="hover:text-leather px-3 py-1.5 leading-none"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(key)}
                      className="text-ink-50 hover:text-clay text-sm underline underline-offset-4 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="bg-surface border-sand h-fit rounded-sm border p-6">
          <h2 className="text-xl">Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-70">Subtotal</dt>
              <dd className="font-medium">
                {formatPrice(subtotalKes, currency)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-70">Shipping</dt>
              <dd className="text-ink-50">Calculated at checkout</dd>
            </div>
          </dl>
          <Button href="/checkout" size="lg" className="mt-7 w-full">
            Checkout
          </Button>
          <p className="text-ink-50 mt-4 text-center text-xs leading-relaxed">
            M-PESA within Kenya · Card &amp; PayPal worldwide
          </p>
        </aside>
      </div>
    </div>
  );
}
