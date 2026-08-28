export type Currency = "KES" | "USD";

/**
 * Static fallback rate: 1 USD = this many KES.
 *
 * Every price in the catalog is stored in KES and converted at render time.
 * Before taking real export orders, replace this with a daily rate pulled from
 * an FX provider — a stale rate here silently under- or over-charges every
 * international customer.
 */
export const KES_PER_USD = 129;

export const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
  { code: "USD", label: "US Dollar", symbol: "$" },
];

/**
 * Converts a KES amount into `currency`, rounded to a clean display value.
 * USD is rounded to whole dollars so the grid never shows $130.23.
 */
export function convert(amountKes: number, currency: Currency): number {
  if (currency === "KES") return Math.round(amountKes);
  return Math.round(amountKes / KES_PER_USD);
}

/** Formats a KES-denominated amount for display in the target currency. */
export function formatPrice(amountKes: number, currency: Currency): string {
  const value = convert(amountKes, currency);
  const formatted = new Intl.NumberFormat("en-KE", {
    maximumFractionDigits: 0,
  }).format(value);
  return currency === "KES" ? `KSh ${formatted}` : `$${formatted}`;
}

/**
 * M-PESA's STK Push API rejects decimals — amounts must be whole shillings.
 * Always send the KES figure through this before handing it to Daraja.
 */
export function toMpesaAmount(amountKes: number): number {
  return Math.max(1, Math.round(amountKes));
}
