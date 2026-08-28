import { NextResponse } from "next/server";
import { convert } from "@/lib/currency";
import { generateOrderReference, priceOrder } from "@/lib/orders";
import { clientIp, readJsonBody } from "@/lib/http";
import { LIMITS, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Card / PayPal checkout for export orders.
 *
 * Intentionally stops short of taking card details: this app never touches a
 * PAN. To go live, swap the simulated branch for a Stripe Checkout Session
 * created with `priced.order.totalKes` (converted to the presentment currency)
 * and return `session.url` for the client to redirect to. Doing it that way
 * keeps the storefront out of PCI scope entirely.
 */
export async function POST(request: Request) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const body = parsed.body;

  const ip = clientIp(request);
  const ipLimit = await rateLimit(
    `checkout:ip:${ip}`,
    LIMITS.perIp.limit,
    LIMITS.perIp.windowSeconds,
  );
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address for your receipt." },
      { status: 400 },
    );
  }

  const zoneId = typeof body.zone === "string" ? body.zone : "";
  const priced = priceOrder(body.items, zoneId);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }

  const reference = generateOrderReference();

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      simulated: true,
      reference,
      totalKes: priced.order.totalKes,
      totalUsd: convert(priced.order.totalKes, "USD"),
      message:
        "Card payments are not configured on this environment, so nothing was charged. " +
        "Set STRIPE_SECRET_KEY and create a Checkout Session in this route to enable them.",
    });
  }

  // Reached only once STRIPE_SECRET_KEY is set — replace with a real
  // stripe.checkout.sessions.create call and return its url.
  return NextResponse.json(
    {
      error:
        "Stripe credentials are present but the Checkout Session is not implemented yet.",
    },
    { status: 501 },
  );
}
