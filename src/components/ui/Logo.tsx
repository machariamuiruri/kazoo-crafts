import { cn } from "@/lib/utils";

/**
 * The Kazoo Crafts mark.
 *
 * Inlined as JSX rather than an <img> to /logo-mark.svg so it can inherit
 * currentColor for the monogram and avoid a second network request in the
 * header. Geometry is kept identical to public/logo-mark.svg and to the
 * favicon renderer — change one, change all three.
 */
export function LogoMark({
  className,
  /** Cream monogram on leather is the default; `onDark` flips to gold. */
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "onDark";
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-8 w-8", className)}
      role="img"
      aria-label="Kazoo Crafts"
      focusable="false"
    >
      <rect
        width="64"
        height="64"
        rx="13"
        fill={variant === "onDark" ? "#F9F6F0" : "#6B3A19"}
      />
      <line
        x1="9.5"
        y1="14"
        x2="9.5"
        y2="50"
        stroke="#D4AF37"
        strokeWidth="1.6"
        strokeDasharray="3.2 3.4"
        strokeLinecap="round"
        opacity="0.9"
      />
      <g
        fill="none"
        stroke={variant === "onDark" ? "#6B3A19" : "#F9F6F0"}
        strokeLinecap="butt"
      >
        <line x1="22" y1="17" x2="22" y2="47" strokeWidth="7" />
        <line x1="25.5" y1="32" x2="43" y2="17" strokeWidth="6" />
        <line x1="25.5" y1="32" x2="44.5" y2="47" strokeWidth="6.5" />
      </g>
    </svg>
  );
}

/** Mark plus wordmark, for the header and footer. */
export function LogoLockup({
  className,
  onDark = false,
  showTagline = false,
}: {
  className?: string;
  onDark?: boolean;
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark
        className="h-8 w-8 shrink-0"
        variant={onDark ? "onDark" : "default"}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-lg tracking-[0.2em] uppercase",
            onDark && "text-cream",
          )}
        >
          Kazoo
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 text-[0.5rem] tracking-[0.22em] uppercase",
              onDark ? "text-cream/50" : "text-ink-50",
            )}
          >
            Handcrafted Leather
          </span>
        )}
      </span>
    </span>
  );
}
