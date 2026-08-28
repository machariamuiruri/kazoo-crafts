import Image from "next/image";
import type { Product } from "@/lib/products";
import { ProductArt } from "@/components/ui/ProductArt";
import { cn } from "@/lib/utils";

/**
 * Product imagery, with a deliberate fallback.
 *
 * No real photography exists yet for any of the 13 catalogue items. Until it
 * does, this renders the generated monogram artwork — which is an intentional
 * interim treatment, not a broken image. Nothing here 404s, shows a torn-image
 * icon, or leaves an empty box.
 *
 * ── Dropping in real photos ──────────────────────────────────────────────
 * 1. Put the file in public/products/, e.g. public/products/chelsea-boot.jpg
 * 2. Add to that product in lib/products.ts:
 *
 *      images: [
 *        { src: "/products/chelsea-boot.jpg",
 *          alt: "Chelsea Boot in Ebony, three-quarter view" },
 *      ]
 *
 * 3. Nothing else changes — every call site already routes through here.
 *
 * Per-finish shots: key the array by finish name and pass `finish` in. The
 * component already receives it for exactly that reason.
 */
export function ProductImage({
  product,
  /** Selected finish — used to pick a matching shot once per-finish photos exist. */
  finishHex,
  finishName,
  className,
  size = "card",
  priority = false,
}: {
  product: Pick<Product, "name" | "images">;
  finishHex: string;
  finishName?: string;
  className?: string;
  size?: "card" | "hero";
  priority?: boolean;
}) {
  const photo = pickPhoto(product.images, finishName);

  if (!photo) {
    return (
      <ProductArt
        finishHex={finishHex}
        name={product.name}
        className={className}
        size={size}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        size === "card" ? "aspect-[4/5]" : "aspect-square",
        className,
      )}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        // Card grid tops out at 4 columns on xl; hero is half the page.
        sizes={
          size === "hero"
            ? "(min-width: 1024px) 50vw, 100vw"
            : "(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
        }
        className="object-cover"
        priority={priority}
      />
    </div>
  );
}

/** Prefers a shot matching the selected finish, else the first image. */
function pickPhoto(images: Product["images"], finishName?: string) {
  if (!images?.length) return null;
  if (finishName) {
    const match = images.find((image) => image.finish === finishName);
    if (match) return match;
  }
  return images[0];
}
