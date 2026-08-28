# Kazoo Crafts

Storefront for Kazoo Crafts (`@26_kazoocraft.ke`) — handcrafted leather goods
made in Kenya, selling domestically via M-PESA and internationally by card.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4.

> ### ⚠️ All product data and brand copy is placeholder
>
> **Nothing in the catalog is real.** Product names, prices, descriptions,
> dimensions, lead times and MOQs in `src/lib/products.ts` are invented
> scaffolding, as is the brand copy on the homepage and About page.
>
> The category structure *is* grounded: it was rebuilt to match the product mix
> visible on [@26_kazoocraft.ke](https://instagram.com/26_kazoocraft.ke) —
> footwear-led (wingtips, cap-toes, boots, sandals) plus a baby shoe line. The
> only copy taken from the real business is "minimal, timeless, intentional"
> and "handcrafted leather goods, made in Kenya", both from the Instagram bio.
>
> Anything reading `PLACEHOLDER` or `to confirm` is waiting on you. An earlier
> draft invented specifics — hide thickness, stitch counts, a workshop address,
> opening hours, and a lifetime repair guarantee. Those were removed because
> they are claims only Kazoo Crafts can make. **Don't reinstate that kind of
> detail unless it's true.**

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
```

## How it's laid out

```
src/
  app/
    page.tsx                        Homepage
    craft/page.tsx                  About (mostly placeholder — needs your story)
    shop/page.tsx                   Listing, filtered by ?category=
    shop/[slug]/page.tsx            Product detail (statically pre-rendered)
    cart/page.tsx                   Bag
    checkout/page.tsx               Checkout, branches M-PESA vs card
    api/checkout/mpesa/route.ts     Triggers an STK Push
    api/checkout/card/route.ts      Card/PayPal entry point (Stripe stub)
    api/mpesa/callback/route.ts     Where Safaricom posts the payment result
  components/
    layout/                         Header, Footer
    product/                        ProductCard, AddToCart
    ui/                             Button, Price, ProductArt, SectionHeading
  lib/
    products.ts                     The catalog (single source of truth)
    orders.ts                       Server-side pricing + shipping zones
    currency.ts                     KES/USD conversion and formatting
    mpesa.ts                        Daraja client — server only
    store.tsx                       Cart + currency context
```

## Design tokens

All brand colours and fonts live in one place: the `@theme` block at the top of
`src/app/globals.css`. Declaring them there makes Tailwind generate matching
utilities — `--color-leather` gives you `bg-leather`, `text-leather`,
`border-leather`, and so on.

| Token             | Value     | Utility     |
| ----------------- | --------- | ----------- |
| `--color-ink`     | `#1A1816` | `bg-ink`    |
| `--color-leather` | `#6B3A19` | `text-leather` |
| `--color-clay`    | `#A0522D` | `bg-clay`   |
| `--color-cream`   | `#F9F6F0` | `bg-cream`  |
| `--color-gold`    | `#D4AF37` | `text-gold` |
| `--color-sand`    | `#E2DCCF` | `border-sand` |

Add a colour there rather than dropping an arbitrary hex into a component.

## Brand assets

The mark is a cream monogram **K** on a leather-brown patch, with a gold
saddle-stitch seam down the left edge.

The K is drawn as **geometry, not type** — no font dependency, and it
rasterises identically at every size. That geometry is duplicated in three
places, so changing one means changing all three:

| File | Role |
| --- | --- |
| `src/components/ui/Logo.tsx` | `LogoMark` / `LogoLockup` used in the header and footer |
| `public/logo-mark.svg` | Standalone master, for external use |
| `src/app/icon.svg` | Favicon source; Next wires the `<link>` automatically |

Raster icons are generated from that same geometry. After changing the mark,
regenerate rather than hand-editing the PNGs:

```bash
python3 scripts/render-icons.py    # requires Pillow
```

`favicon.ico` is written as a raw ICO container rather than through Pillow's
ICO writer, because Pillow derives every frame by downscaling a single source
image and silently drops sizes larger than it. Writing the container directly
allows genuinely different artwork per size: **the stitch detail is omitted
below 32px**, where a 1.6px dashed line renders as noise rather than detail.

Icons produced: `favicon.ico` (16/24/32/48/64), `apple-icon.png` (180, opaque —
iOS composites onto white and would otherwise show white corners),
`icon-192.png` and `icon-512.png` for the web manifest.

## Payments

Copy `.env.example` to `.env.local` and fill it in. **Both payment methods
degrade gracefully:** with no credentials set, checkout completes and returns a
`simulated: true` response that says plainly that nothing was charged. That
makes the whole flow testable before Daraja and Stripe accounts exist.

### M-PESA (domestic)

`POST /api/checkout/mpesa` re-prices the cart, then calls Daraja's STK Push so
the customer gets a PIN prompt. Two things to understand before going live:

1. **A successful STK Push does not mean the customer paid.** It means
   Safaricom accepted the request. Payment is only confirmed when Safaricom
   POSTs to `MPESA_CALLBACK_URL`.
2. **The callback is unauthenticated by design.** Safaricom won't send a
   secret, so restrict `/api/mpesa/callback` to Safaricom's published IP ranges
   at the edge, or embed an unguessable token in the callback URL. Otherwise
   anyone can post a forged "payment succeeded".

Callbacks can also arrive more than once for the same `CheckoutRequestID`, so
key fulfilment on it and make it idempotent.

### Card / PayPal (export)

`POST /api/checkout/card` validates and prices the order but deliberately stops
short of taking card details — this app never touches a card number. To go
live, create a Stripe Checkout Session in that route and return `session.url`
for the client to redirect to, which keeps the storefront out of PCI scope.

## Deploying to Vercel

The production build is verified: `next build` succeeds, all product pages
pre-render, and the app runs correctly under the production CSP (which is
stricter than dev — it drops `'unsafe-eval'`).

### 1. Push to GitHub

Vercel's git integration is the easiest route. See the repo setup steps at the
end of this section if `origin` isn't pushed yet.

### 2. Import the project

At [vercel.com/new](https://vercel.com/new), import the repo. Framework preset,
build command and output directory are all detected automatically — **don't
override them**.

⚠️ **Set the Node version to 20 or higher** in Project Settings → General.
Vercel's default may be older, and while this project builds on Node 18
locally, 20+ is what you want in production.

### 3. Add environment variables

Copy from `.env.example`. At minimum, before accepting real orders:

| Variable | Why |
| --- | --- |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | **Required.** Without these, rate limiting and callback idempotency silently stop working across serverless instances. Add the Vercel KV / Upstash integration and these are set for you. |
| `MPESA_CALLBACK_TOKEN` | Generate with `openssl rand -hex 32`. Anyone who learns it can post fake payment confirmations. |
| `MPESA_CALLBACK_URL` | Must be the full path *including* the token: `https://<domain>/api/mpesa/callback/<token>` |
| `MPESA_CONSUMER_KEY` / `_SECRET` / `_SHORTCODE` / `_PASSKEY` | From the Daraja portal. Leave blank to keep checkout in simulated mode. |

Set them for **Production** and **Preview** separately — a preview deployment
pointing at your live paybill will take real money.

### 4. Restrict access while the catalog is fake

Until real products replace the placeholders, turn on **Deployment Protection**
(Project Settings → Deployment Protection → Vercel Authentication). The site
currently shows invented product names and invented prices under a real brand
name — a customer finding it would reasonably assume those are genuine.

### 5. M-PESA note

Daraja *sandbox* is open to anyone. *Production* STK Push requires a registered
paybill or till and Safaricom approval, which takes time — check what that
involves before planning a launch around it.

## Security

### What is enforced

| Control | Where |
| --- | --- |
| Server-side re-pricing (client prices ignored) | `lib/orders.ts` |
| Finish / size / MOQ validation | `lib/orders.ts` |
| Rate limiting — 10/10min per IP, 3/10min per phone | `lib/rate-limit.ts` |
| Callback secret token, compared in constant time | `api/mpesa/callback/[token]` |
| Callback idempotency on `CheckoutRequestID` | `lib/kv.ts` |
| Optional callback IP allowlist | `MPESA_CALLBACK_ALLOWED_IPS` |
| 16 KB request body cap | `lib/http.ts` |
| Secrets can't reach the client bundle | `import "server-only"` |
| CSP, HSTS, `X-Frame-Options`, `Referrer-Policy` | `next.config.ts` |
| No card data ever touches this app | Stripe redirect design |

The per-phone rate limit matters most: without it the STK Push endpoint can be
used to spray real PIN prompts at arbitrary handsets — harassment carried out
with your paybill, and a good way to get it suspended.

### ⚠️ KV is required in production

Rate limiting and callback idempotency both fall back to **per-instance
memory** when `KV_REST_API_*` is unset. On Vercel that is not a control: each
serverless instance has its own memory, so limits can be bypassed by spreading
requests, and duplicate callbacks are not deduplicated. Add the Vercel KV /
Upstash integration before launch.

### Still outstanding

- **Amount verification.** The callback currently trusts the amount it's told
  was paid, because there's no persisted order to compare against. Once orders
  exist, look the order up by `CheckoutRequestID`, confirm the amount matches
  what was quoted, and only then mark it paid. This is the single most
  important remaining item.
- **CSP allows `'unsafe-inline'` for scripts.** Next injects inline bootstrap
  scripts; locking that down needs per-request nonces from middleware. The
  current policy restricts where scripts load *from* but won't stop an injected
  inline script.
- **`postcss` advisories** reach us via Next. The fix is Next 16, which needs
  Node 20. These are build-time issues requiring attacker-controlled CSS, so
  the practical risk here is low — but resolve it at the Node upgrade.
- **No independent review.** The same author wrote the code and its security
  controls. Get a review and a penetration test before handling real money.

## Things to change before taking real money

- **Replace the placeholder catalog and copy.** See the warning at the top.
  This is the biggest outstanding item: real product names, real prices, real
  specifications, and your own brand story.
- **Add real photography.** `ProductArt` draws a leather-grain gradient with a
  monogram in place of photos. Every call site passes the props an `<Image>`
  would need, so swapping it out is contained. Note that Instagram CDN URLs
  are signed and expire — photos need to be real files in `/public`, not
  hotlinked.
- **The FX rate is hardcoded.** `KES_PER_USD` in `src/lib/currency.ts` is a
  static constant. A stale rate silently mis-charges every international
  customer — pull a daily rate before launch.
- **Orders aren't persisted.** Both checkout routes compute a reference and
  return it, but nothing is written to a database, so a confirmed M-PESA
  callback has no order to attach itself to. This is the first thing to add.
- **No stock model.** Everything is made to order, so nothing sells out. If
  that changes, quantity needs to be checked in `priceOrder`.
- **No transactional email.** Nothing sends a receipt yet.
- **No ESLint.** The current ESLint line needs Node 20+, and this project was
  set up on Node 18. Re-add it (`npm i -D eslint eslint-config-next`) once the
  runtime is upgraded; `npm run typecheck` covers type safety in the meantime.

## Prices and trust

Product prices are stored once, in KES, in `src/lib/products.ts`. The browser
never sends prices to the server — checkout sends only slugs, finishes, sizes
and quantities, and `priceOrder()` in `src/lib/orders.ts` re-derives the total
from the catalog. It also rejects unavailable finishes and sizes, and enforces
corporate minimum order quantities. Keep it that way; trusting a
client-supplied price is how storefronts get charged one shilling.
