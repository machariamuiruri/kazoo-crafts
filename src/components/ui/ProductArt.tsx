import { cn } from "@/lib/utils";

type Props = {
  /** Hex of the selected leather finish; drives the gradient. */
  finishHex: string;
  name: string;
  className?: string;
  /** Larger treatment for the product detail page. */
  size?: "card" | "hero";
};

/**
 * Stand-in for product photography.
 *
 * Renders a leather-grain gradient in the chosen finish with a dashed border
 * and the product monogram. Swap this component for <Image> once real shots
 * exist — every call site passes the same props a photo would need.
 */
export function ProductArt({ finishHex, name, className, size = "card" }: Props) {
  const monogram = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "leather-swatch relative overflow-hidden",
        size === "card" ? "aspect-[4/5]" : "aspect-square",
        className,
      )}
      style={{ "--finish": finishHex } as React.CSSProperties}
      role="img"
      aria-label={`${name} in leather`}
    >
      {/* Decorative dashed inset, suggesting a stitched edge */}
      <div
        className={cn(
          "absolute rounded-[2px] border border-dashed border-cream/25",
          size === "card" ? "inset-3" : "inset-6",
        )}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-serif text-cream/30 select-none",
            size === "card" ? "text-5xl" : "text-8xl",
          )}
        >
          {monogram}
        </span>
      </div>
      {/* Gold hardware glint in the corner */}
      <div
        className={cn(
          "absolute rounded-full bg-gold/70",
          size === "card" ? "right-4 bottom-4 h-2 w-2" : "right-8 bottom-8 h-3 w-3",
        )}
      />
    </div>
  );
}
