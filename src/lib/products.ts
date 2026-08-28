/**
 * PLACEHOLDER CATALOG — nothing below is confirmed.
 *
 * The category structure is modelled on the real product mix visible on
 * instagram.com/26_kazoocraft.ke (footwear-led: wingtips, cap-toes, boots and
 * sandals, plus a baby shoe line), but every product name, price, description
 * and specification here is invented scaffolding.
 *
 * Before launch, replace all of it with real values. In particular:
 *   - `priceKes` figures are placeholders, not real pricing
 *   - `description` lines describe the product *type* generically; they say
 *     nothing about materials or construction, which are unconfirmed
 *   - lead times are guesses
 *
 * CONFIRMED by Frank and safe to publish:
 *   - `moq`: Executive Folio 25, Branded Tag Set 50
 *
 * Anything still unknown lives as a question in CONTENT_NEEDED (lib/draft.ts)
 * and renders behind <Draft>, never to customers.
 *
 * Prices are stored once, here, in KES. The browser never sends a price to the
 * server; see priceOrder() in lib/orders.ts.
 */

export type Category =
  | "footwear"
  | "baby"
  | "bags"
  | "accessories"
  | "corporate";

export type LeatherFinish = {
  name: string;
  /** Hex used for the swatch and the generated product artwork. */
  hex: string;
};

export type Product = {
  slug: string;
  name: string;
  category: Category;
  /** Placeholder price in Kenyan Shillings. All other currencies derive from this. */
  priceKes: number;
  /** Optional strike-through price in KES, for sale items. */
  compareAtKes?: number;
  tagline: string;
  description: string;
  details: string[];
  /**
   * Real photography. Absent on every product today — ProductImage falls back
   * to the generated monogram artwork until these exist. See
   * components/product/ProductImage.tsx for how to add them.
   */
  images?: { src: string; alt: string; finish?: string }[];
  finishes: LeatherFinish[];
  /** Sizes for footwear and baby shoes; omitted for everything else. */
  sizes?: string[];
  /** Working days needed before dispatch. Drives the PDP delivery note. */
  leadTimeDays: number;
  featured?: boolean;
  /**
   * Minimum order quantity — corporate gifting SKUs only.
   * Confirmed by Frank, so these are published and enforced at checkout.
   */
  moq?: number;
};

export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  {
    id: "footwear",
    label: "Footwear",
    blurb: "Wingtips, cap-toes, boots and sandals, made to your size.",
  },
  {
    id: "baby",
    label: "Baby Shoes",
    blurb: "Soft-soled first shoes in the same leather as the grown-up pairs.",
  },
  {
    id: "bags",
    label: "Bags",
    blurb: "Totes and satchels for everyday carry.",
  },
  {
    id: "accessories",
    label: "Accessories",
    blurb: "Belts, wallets and small leather goods.",
  },
  {
    id: "corporate",
    label: "Corporate Gifting",
    blurb: "Branded leather gifts for teams, clients and conferences.",
  },
];

const CHESTNUT: LeatherFinish = { name: "Chestnut", hex: "#6B3A19" };
const SIENNA: LeatherFinish = { name: "Sienna", hex: "#A0522D" };
const EBONY: LeatherFinish = { name: "Ebony", hex: "#1A1816" };
const SADDLE: LeatherFinish = { name: "Saddle Tan", hex: "#B87333" };
const OLIVE: LeatherFinish = { name: "Olive", hex: "#4A4A32" };

/** Standard EU adult run. Confirm the real range before launch. */
const ADULT_SIZES = ["39", "40", "41", "42", "43", "44", "45"];
/** EU infant sizing. Confirm the real range before launch. */
const BABY_SIZES = ["16", "17", "18", "19", "20", "21", "22"];

/*
 * `details` holds only CONFIRMED facts — currently just the size run.
 *
 * Leather type, construction, lining and dimensions were previously rendered
 * as "— to confirm" lines, which meant customers read the words "to confirm"
 * on every product page. Those questions now live in
 * CONTENT_NEEDED.productSpecs (lib/draft.ts) and surface behind <Draft>, so
 * they're visible to Frank and invisible to visitors. Add real spec lines
 * here as they're confirmed.
 */

export const PRODUCTS: Product[] = [
  // ---------------------------------------------------------------- Footwear
  {
    slug: "wingtip-brogue",
    name: "Wingtip Brogue",
    category: "footwear",
    priceKes: 12000,
    tagline: "Full brogue with a decorative wing across the toe.",
    description:
      "A classic wingtip: the toe cap is cut in a W shape running back along both sides of the shoe, with punched broguing along the seams.",
    details: [`Sizes ${ADULT_SIZES[0]}–${ADULT_SIZES.at(-1)}`],
    finishes: [CHESTNUT, EBONY, SADDLE],
    sizes: ADULT_SIZES,
    leadTimeDays: 14,
    featured: true,
  },
  {
    slug: "cap-toe-oxford",
    name: "Cap-Toe Oxford",
    category: "footwear",
    priceKes: 11500,
    tagline: "A plain cap-toe with closed lacing.",
    description:
      "The most formal shape in the range — a straight seam across the toe and closed lacing, where the eyelet facings are stitched under the vamp.",
    details: [`Sizes ${ADULT_SIZES[0]}–${ADULT_SIZES.at(-1)}`],
    finishes: [EBONY, CHESTNUT],
    sizes: ADULT_SIZES,
    leadTimeDays: 14,
    featured: true,
  },
  {
    slug: "chelsea-boot",
    name: "Chelsea Boot",
    category: "footwear",
    priceKes: 15000,
    tagline: "Ankle boot with elasticated side panels, no laces.",
    description:
      "Pulls on at the tab, with elastic gussets at both sides so the ankle stays close without lacing.",
    details: [`Sizes ${ADULT_SIZES[0]}–${ADULT_SIZES.at(-1)}`],
    finishes: [CHESTNUT, EBONY],
    sizes: ADULT_SIZES,
    leadTimeDays: 18,
  },
  {
    slug: "leather-sandal",
    name: "Leather Sandal",
    category: "footwear",
    priceKes: 6500,
    tagline: "Open sandal with a leather footbed.",
    description:
      "Strapped open sandal on a leather footbed.",
    details: [`Sizes ${ADULT_SIZES[0]}–${ADULT_SIZES.at(-1)}`],
    finishes: [SADDLE, CHESTNUT, OLIVE],
    sizes: ADULT_SIZES,
    leadTimeDays: 10,
    featured: true,
  },
  {
    slug: "derby-shoe",
    name: "Derby Shoe",
    category: "footwear",
    priceKes: 11000,
    compareAtKes: 12500,
    tagline: "Open lacing, a little roomier than an oxford.",
    description:
      "Eyelet facings sit on top of the vamp rather than under it, which opens the throat up and suits a higher instep.",
    details: [`Sizes ${ADULT_SIZES[0]}–${ADULT_SIZES.at(-1)}`],
    finishes: [CHESTNUT, SADDLE, EBONY],
    sizes: ADULT_SIZES,
    leadTimeDays: 14,
  },

  // -------------------------------------------------------------- Baby shoes
  {
    slug: "baby-bootie",
    name: "Baby Bootie",
    category: "baby",
    priceKes: 2500,
    tagline: "Soft-soled bootie for pre-walkers.",
    description:
      "A soft, flexible bootie for babies not yet walking.",
    details: [`EU sizes ${BABY_SIZES[0]}–${BABY_SIZES.at(-1)}`],
    finishes: [SADDLE, CHESTNUT, SIENNA],
    sizes: BABY_SIZES,
    leadTimeDays: 7,
    featured: true,
  },
  {
    slug: "baby-first-walker",
    name: "First-Walker Shoe",
    category: "baby",
    priceKes: 3200,
    tagline: "A firmer sole for first steps.",
    description:
      "Built with more structure than the bootie, for babies starting to walk.",
    details: [`EU sizes ${BABY_SIZES[0]}–${BABY_SIZES.at(-1)}`],
    finishes: [CHESTNUT, EBONY, SADDLE],
    sizes: BABY_SIZES,
    leadTimeDays: 7,
  },

  // -------------------------------------------------------------------- Bags
  {
    slug: "leather-tote",
    name: "Leather Tote",
    category: "bags",
    priceKes: 9500,
    tagline: "Open-top tote for everyday carry.",
    description:
      "An unstructured open-top tote.",
    details: [],
    finishes: [SADDLE, CHESTNUT, OLIVE],
    leadTimeDays: 7,
  },
  {
    slug: "crossbody-satchel",
    name: "Crossbody Satchel",
    category: "bags",
    priceKes: 8800,
    tagline: "Flap-over satchel on an adjustable strap.",
    description:
      "Flap-closing crossbody on an adjustable strap.",
    details: [],
    finishes: [CHESTNUT, EBONY],
    leadTimeDays: 7,
  },

  // ------------------------------------------------------------- Accessories
  {
    slug: "leather-belt",
    name: "Leather Belt",
    category: "accessories",
    priceKes: 2800,
    tagline: "Leather belt with a metal buckle.",
    description: "A leather belt fastening on a metal buckle.",
    details: [],
    finishes: [CHESTNUT, EBONY, SADDLE],
    sizes: ["30", "32", "34", "36", "38", "40", "42"],
    leadTimeDays: 3,
  },
  {
    slug: "bifold-wallet",
    name: "Bifold Wallet",
    category: "accessories",
    priceKes: 2200,
    tagline: "Folding wallet with card slots and a note sleeve.",
    description:
      "A bifold wallet: folds once, with card slots inside and a full-width sleeve for notes.",
    details: [],
    finishes: [EBONY, CHESTNUT, SIENNA],
    leadTimeDays: 3,
    featured: true,
  },

  // --------------------------------------------------------------- Corporate
  {
    slug: "executive-folio",
    name: "Executive Folio",
    category: "corporate",
    priceKes: 6500,
    tagline: "A4 folio, brandable with your mark.",
    description:
      "An A4 document folio intended to carry your branding.",
    details: [],
    finishes: [EBONY, CHESTNUT],
    leadTimeDays: 21,
    moq: 25,
  },
  {
    slug: "branded-tag-set",
    name: "Branded Tag Set",
    category: "corporate",
    priceKes: 1200,
    tagline: "Leather luggage tags, sold in sets.",
    description:
      "Luggage tags supplied in sets and carrying your mark.",
    details: [],
    finishes: [CHESTNUT, EBONY, SADDLE],
    leadTimeDays: 14,
    moq: 50,
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getByCategory(category: Category): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getFeatured(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

/** Other products in the same category, excluding the one being viewed. */
export function getRelated(slug: string, limit = 3): Product[] {
  const product = getProduct(slug);
  if (!product) return [];
  return PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== slug,
  ).slice(0, limit);
}
