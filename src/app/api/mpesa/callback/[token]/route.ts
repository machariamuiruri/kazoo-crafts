import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { claimOnce, kvIsConfigured } from "@/lib/kv";
import { clientIp, readJsonBody } from "@/lib/http";

export const runtime = "nodejs";

type CallbackItem = { Name: string; Value?: string | number };

/** Safaricom expects this exact shape, and a 200, or it retries. */
const ACK = { ResultCode: 0, ResultDesc: "Accepted" };

/**
 * Constant-time string comparison, so the token can't be recovered by timing
 * how long a wrong guess takes to reject.
 */
function secretsMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Optional IP allowlist, from MPESA_CALLBACK_ALLOWED_IPS (comma separated).
 *
 * Left unset it only warns, because a wrong list silently drops real payments —
 * a worse failure than the one it prevents, given the token already gates this
 * endpoint. Safaricom publishes its callback ranges; verify them against
 * current Daraja documentation before enabling this, rather than trusting any
 * list copied from elsewhere.
 */
function ipAllowed(request: Request): boolean {
  const configured = process.env.MPESA_CALLBACK_ALLOWED_IPS;
  if (!configured) return true;

  const allowed = configured
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return allowed.includes(clientIp(request));
}

/**
 * Where Safaricom posts the outcome of an STK Push.
 *
 * Safaricom sends no signature or shared secret, so this endpoint is defended
 * three ways instead:
 *
 *   1. An unguessable token in the URL path (MPESA_CALLBACK_TOKEN), which is
 *      the primary control — register the full URL with Daraja.
 *   2. An optional IP allowlist (MPESA_CALLBACK_ALLOWED_IPS).
 *   3. Idempotency on CheckoutRequestID, since Safaricom retries and may
 *      deliver the same callback more than once.
 *
 * Every response is 200 with ResultCode 0 — including rejections. Returning an
 * error would make Safaricom retry, and telling an attacker their token was
 * wrong is free information. Rejections are logged instead.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const expected = process.env.MPESA_CALLBACK_TOKEN;

  if (!expected) {
    console.error(
      "[mpesa] callback received but MPESA_CALLBACK_TOKEN is not set — rejecting",
    );
    return NextResponse.json(ACK);
  }

  if (!secretsMatch(token, expected)) {
    console.warn("[mpesa] callback rejected: bad token", { ip: clientIp(request) });
    return NextResponse.json(ACK);
  }

  if (!ipAllowed(request)) {
    console.warn("[mpesa] callback rejected: IP not allowlisted", {
      ip: clientIp(request),
    });
    return NextResponse.json(ACK);
  }

  const parsed = await readJsonBody<{
    Body?: {
      stkCallback?: {
        MerchantRequestID?: string;
        CheckoutRequestID?: string;
        ResultCode?: number;
        ResultDesc?: string;
        CallbackMetadata?: { Item?: CallbackItem[] };
      };
    };
  }>(request);

  // Acknowledge unparseable bodies — retrying won't make them parseable.
  if (!parsed.ok) return NextResponse.json(ACK);

  const callback = parsed.body.Body?.stkCallback;
  const checkoutRequestId = callback?.CheckoutRequestID;
  if (!checkoutRequestId) return NextResponse.json(ACK);

  // Process each CheckoutRequestID once. Retained for 24h, comfortably longer
  // than Safaricom's retry window.
  const isFirstDelivery = await claimOnce(
    `mpesa:callback:${checkoutRequestId}`,
    60 * 60 * 24,
  );
  if (!isFirstDelivery) {
    console.info("[mpesa] duplicate callback ignored", { checkoutRequestId });
    return NextResponse.json(ACK);
  }

  if (!kvIsConfigured()) {
    console.warn(
      "[mpesa] KV not configured — duplicate callbacks will NOT be " +
        "deduplicated across serverless instances",
    );
  }

  if (callback.ResultCode === 0) {
    const metadata = Object.fromEntries(
      (callback.CallbackMetadata?.Item ?? []).map((item) => [
        item.Name,
        item.Value,
      ]),
    );

    // TODO — once orders are persisted, this is where the real verification
    // goes, and it matters more than anything above:
    //   1. Look the order up by CheckoutRequestID. No order => drop it.
    //   2. Confirm Number(metadata.Amount) equals the amount that order was
    //      quoted. Never trust the amount in the callback body.
    //   3. Only then mark it paid and trigger fulfilment.
    // Until that exists, a valid-token callback is logged and nothing ships.
    console.info("[mpesa] payment confirmed", {
      checkoutRequestId,
      receipt: metadata.MpesaReceiptNumber,
      amount: metadata.Amount,
      // Phone number deliberately omitted — it's PII and logs are rarely as
      // access-controlled as a database.
    });
  } else {
    // 1032 = cancelled by user, 1037 = timed out, 1 = insufficient funds.
    console.warn("[mpesa] payment not completed", {
      checkoutRequestId,
      code: callback.ResultCode,
      reason: callback.ResultDesc,
    });
  }

  return NextResponse.json(ACK);
}
