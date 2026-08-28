/**
 * Draft-content gating.
 *
 * Several sections of this site are waiting on facts only Kazoo Crafts can
 * supply — how the shoes are made, what leather is used, whether repairs are
 * offered, the workshop address. Those must never be guessed at: an earlier
 * draft invented a "lifetime repairs" promise that read plausibly, was false,
 * and had to be pulled.
 *
 * So instead of placeholder prose, each unfinished section is wrapped in
 * <Draft> and carries the specific questions that need answering. Customers
 * see nothing; Frank sees the section plus its intake list.
 *
 * Visible when NODE_ENV !== "production", or when
 * NEXT_PUBLIC_SHOW_DRAFT_CONTENT=1 (set that on a Vercel preview to review
 * outstanding content without exposing it on the live domain).
 */
export function isDraftVisible(): boolean {
  if (process.env.NEXT_PUBLIC_SHOW_DRAFT_CONTENT === "1") return true;
  return process.env.NODE_ENV !== "production";
}

/**
 * Content still awaiting real facts, keyed by where it appears.
 *
 * Each entry lists the questions to answer. Keep these as *questions*, not
 * draft prose — suggested wording tends to get approved on sight, which is
 * how invented facts reach production.
 */
export const CONTENT_NEEDED = {
  aboutStory: [
    "When did Kazoo Crafts start, and who started it?",
    "Where do you work — home workshop, shared unit, a named area of Nairobi?",
    "Who makes the pieces: just you, or a team? How many?",
    "Why leather, and why footwear specifically?",
    "What is the one thing you want customers to understand about how you build?",
  ],
  aboutPrinciples: [
    "Name three things you genuinely will not compromise on.",
    "For each: what do you actually do, in one sentence a customer would believe?",
    "Avoid anything you can't evidence if asked.",
  ],
  careAndRepair: [
    "Do you offer repairs at all? On what terms — free, paid, time-limited?",
    "What should a customer do to look after the leather?",
    "Do you have a returns or exchange policy? What is it?",
    "NOTE: an earlier draft promised open-ended lifetime repairs. That was invented and removed. Only publish a commitment you intend to honour.",
  ],
  processSteps: [
    "Walk through making one pair, start to finish, in 3–5 stages.",
    "For each stage: what happens, and roughly how long does it take?",
    "Which stages are done by hand, and which use machinery?",
  ],
  corporateTerms: [
    "How is branding applied — deboss, foil, print, stamp?",
    "What is the lead time for a corporate order?",
    "Is there setup or artwork cost on top of unit price?",
    "How are they packaged for handover?",
    "(MOQs confirmed by Frank: Executive Folio 25, Branded Tag Set 50.)",
  ],
  footerContact: [
    "Public address, or is the workshop appointment-only?",
    "Opening hours.",
    "Contact email for orders and enquiries.",
  ],
  productSpecs: [
    "Leather type and weight, per product (e.g. full-grain, vegetable-tanned, 2mm).",
    "Construction method — stitched, cemented, Blake, Goodyear?",
    "Lining material, or unlined.",
    "Finished dimensions for bags and small goods.",
  ],
  sizeConversion: [
    "Insole length in cm for each EU size you make (39–45).",
    "Do your shoes run true to size, small, or large?",
    "Baby sizes 16–22: same, insole length in cm per size.",
    "NOTE: sizing depends on your lasts, so this cannot be taken from a standard chart.",
  ],
} as const;

export type ContentKey = keyof typeof CONTENT_NEEDED;
