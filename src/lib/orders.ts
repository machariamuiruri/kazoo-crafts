import { getProduct } from "@/lib/products";

// Deliberately NOT marked server-only: the checkout UI imports SHIPPING to
// render the destination picker. Keep it that way — this module must never
// gain a dependency on secrets, or it will leak them into the client bundle.

export type ShippingZone = "nairobi" | "kenya" | "east-africa" | "international";

export const SHIPPING: {
  id: ShippingZone;
  label: string;
  costKes: number;
  eta: string;
  /** Zones outside Kenya can't pay by M-PESA. */
  mpesaEligible: boolean;
}[] = [
  {
    id: "nairobi",
    label: "Nairobi",
    costKes: 0,
    eta: "1–2 days after dispatch",
    mpesaEligible: true,
  },
  {
    id: "kenya",
    label: "Rest of Kenya",
    costKes: 500,
    eta: "2–4 days after dispatch",
    mpesaEligible: true,
  },
  {
    id: "east-africa",
    label: "East Africa",
    costKes: 2500,
    eta: "5–8 days after dispatch",
    mpesaEligible: false,
  },
  {
    id: "international",
    label: "Rest of world (DHL)",
    costKes: 4500,
    eta: "5–10 days after dispatch",
    mpesaEligible: false,
  },
];

export function getShippingZone(id: string) {
  return SHIPPING.find((zone) => zone.id === id);
}

/** What the browser sends up. Prices are deliberately absent. */
export type IncomingLine = {
  slug: string;
  finish: string;
  size?: string;
  qty: number;
};

export type PricedLine = {
  slug: string;
  name: string;
  finish: string;
  size?: string;
  qty: number;
  unitPriceKes: number;
  lineTotalKes: number;
};

export type PricedOrder = {
  lines: PricedLine[];
  subtotalKes: number;
  shippingKes: number;
  totalKes: number;
};

/**
 * Re-prices a cart from the server-side catalog.
 *
 * The client never sends prices and we never read them if it does — otherwise
 * anyone could POST a 1-shilling order. Quantities and MOQs are validated here
 * for the same reason.
 */
export function priceOrder(
  lines: unknown,
  zoneId: string,
): { ok: true; order: PricedOrder } | { ok: false; error: string } {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { ok: false, error: "Your bag is empty." };
  }

  const zone = getShippingZone(zoneId);
  if (!zone) {
    return { ok: false, error: "Choose a delivery destination." };
  }

  const priced: PricedLine[] = [];

  for (const raw of lines) {
    const line = raw as Partial<IncomingLine>;
    if (typeof line?.slug !== "string") {
      return { ok: false, error: "Malformed item in bag." };
    }

    const product = getProduct(line.slug);
    if (!product) {
      return { ok: false, error: `We no longer stock "${line.slug}".` };
    }

    const qty = Number(line.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
      return { ok: false, error: `Invalid quantity for ${product.name}.` };
    }

    if (product.moq !== undefined && qty < product.moq) {
      return {
        ok: false,
        error: `${product.name} has a minimum order of ${product.moq}.`,
      };
    }

    // Reject finishes and sizes that aren't actually offered.
    const finish = product.finishes.find((f) => f.name === line.finish);
    if (!finish) {
      return { ok: false, error: `Unavailable finish for ${product.name}.` };
    }

    if (product.sizes?.length) {
      if (!line.size || !product.sizes.includes(line.size)) {
        return { ok: false, error: `Choose a size for ${product.name}.` };
      }
    }

    priced.push({
      slug: product.slug,
      name: product.name,
      finish: finish.name,
      size: line.size,
      qty,
      unitPriceKes: product.priceKes,
      lineTotalKes: product.priceKes * qty,
    });
  }

  const subtotalKes = priced.reduce((sum, line) => sum + line.lineTotalKes, 0);

  return {
    ok: true,
    order: {
      lines: priced,
      subtotalKes,
      shippingKes: zone.costKes,
      totalKes: subtotalKes + zone.costKes,
    },
  };
}

/** Short human-facing order reference, e.g. KZ-7Q4M2X. */
export function generateOrderReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `KZ-${suffix}`;
}
