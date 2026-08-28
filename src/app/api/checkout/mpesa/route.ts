import { NextResponse } from "next/server";
import {
  initiateStkPush,
  isMpesaConfigured,
  normalizeKenyanPhone,
} from "@/lib/mpesa";
import {
  generateOrderReference,
  getShippingZone,
  priceOrder,
} from "@/lib/orders";
import { clientIp, readJsonBody } from "@/lib/http";
import { LIMITS, rateLimit } from "@/lib/rate-limit";

/** Daraja calls out to Safaricom, so this can't run on the edge runtime. */
export const runtime = "nodejs";

function tooMany(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many attempts. Please wait a few minutes and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

export async function POST(request: Request) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const body = parsed.body;

  // Limit by IP before doing any work.
  const ip = clientIp(request);
  const ipLimit = await rateLimit(
    `checkout:ip:${ip}`,
    LIMITS.perIp.limit,
    LIMITS.perIp.windowSeconds,
  );
  if (!ipLimit.allowed) return tooMany(ipLimit.retryAfter);

  const phoneInput = typeof body.phone === "string" ? body.phone : "";
  const phone = normalizeKenyanPhone(phoneInput);
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid Safaricom number, e.g. 0712 345 678." },
      { status: 400 },
    );
  }

  // Limit by destination handset too. An attacker rotating IPs could otherwise
  // still spray PIN prompts at one victim's phone.
  const phoneLimit = await rateLimit(
    `checkout:phone:${phone}`,
    LIMITS.perPhone.limit,
    LIMITS.perPhone.windowSeconds,
  );
  if (!phoneLimit.allowed) return tooMany(phoneLimit.retryAfter);

  const zoneId = typeof body.zone === "string" ? body.zone : "";
  const zone = getShippingZone(zoneId);
  if (!zone?.mpesaEligible) {
    return NextResponse.json(
      { error: "M-PESA is only available for deliveries within Kenya." },
      { status: 400 },
    );
  }

  // Prices come from the catalog, never from the request body.
  const priced = priceOrder(body.items, zoneId);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: 400 });
  }

  const reference = generateOrderReference();

  if (!isMpesaConfigured()) {
    // Lets the checkout UI be exercised end to end before Daraja credentials
    // exist. Returns the same shape as a real push so the client needs no
    // special case — but never pretends money moved.
    return NextResponse.json({
      simulated: true,
      reference,
      totalKes: priced.order.totalKes,
      message:
        "M-PESA is not configured on this environment, so no STK push was sent. " +
        "Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, " +
        "MPESA_PASSKEY and MPESA_CALLBACK_URL to enable live payments.",
    });
  }

  try {
    const result = await initiateStkPush({
      amount: priced.order.totalKes,
      phone,
      accountReference: reference,
      description: "Kazoo order",
    });

    // At this point the customer has a PIN prompt on their handset. The order
    // is NOT paid until the callback arrives — persist it as pending here once
    // a database is wired up, recording checkoutRequestId and totalKes so the
    // callback can verify the amount it's told was paid.
    return NextResponse.json({
      simulated: false,
      reference,
      totalKes: priced.order.totalKes,
      checkoutRequestId: result.checkoutRequestId,
      message: result.customerMessage,
    });
  } catch (error) {
    console.error("[mpesa] STK push failed", error);
    return NextResponse.json(
      {
        error:
          "We couldn't reach M-PESA just now. Please try again, or pay by card.",
      },
      { status: 502 },
    );
  }
}
