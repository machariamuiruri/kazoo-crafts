/**
 * Safaricom Daraja (M-PESA) STK Push client.
 *
 * Server-only — every function here touches the consumer secret and passkey.
 * The import below makes that enforceable rather than advisory: pulling this
 * module into a "use client" component now fails the build instead of failing
 * silently at runtime.
 */
import "server-only";

const SANDBOX_BASE = "https://sandbox.safaricom.co.ke";
const PRODUCTION_BASE = "https://api.safaricom.co.ke";

type MpesaConfig = {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passkey: string;
  callbackUrl: string;
};

/**
 * Reads Daraja credentials from the environment.
 *
 * Throws rather than falling back to defaults: a silently misconfigured
 * payment gateway is far worse than a loud 500 at request time.
 */
export function getMpesaConfig(): MpesaConfig {
  const required = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortCode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `M-PESA is not configured. Missing environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    baseUrl:
      process.env.MPESA_ENV === "production" ? PRODUCTION_BASE : SANDBOX_BASE,
    consumerKey: required.consumerKey!,
    consumerSecret: required.consumerSecret!,
    shortCode: required.shortCode!,
    passkey: required.passkey!,
    callbackUrl: required.callbackUrl!,
  };
}

/** True when Daraja credentials are present, without throwing. */
export function isMpesaConfigured(): boolean {
  try {
    getMpesaConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalises Kenyan mobile numbers to Daraja's 2547XXXXXXXX / 2541XXXXXXXX form.
 * Returns null when the input can't be a Kenyan mobile number.
 */
export function normalizeKenyanPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");

  // 0712345678 → 254712345678
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  // 712345678 → 254712345678
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  // Already 254712345678
  if (/^254[17]\d{8}$/.test(digits)) return digits;

  return null;
}

/** Daraja wants local Nairobi time as YYYYMMDDHHmmss. */
function darajaTimestamp(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return [
    get("year"),
    get("month"),
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  ].join("");
}

/**
 * Exchanges the consumer key/secret for a short-lived bearer token.
 * Tokens last an hour; this fetches per request rather than caching, which is
 * fine at storefront volume and avoids serving a stale token after a rotation.
 */
async function getAccessToken(config: MpesaConfig): Promise<string> {
  const credentials = Buffer.from(
    `${config.consumerKey}:${config.consumerSecret}`,
  ).toString("base64");

  const response = await fetch(
    `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `M-PESA auth failed (${response.status}): ${await response.text()}`,
    );
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("M-PESA auth response contained no access_token");
  }
  return data.access_token;
}

export type StkPushResult = {
  merchantRequestId: string;
  checkoutRequestId: string;
  customerMessage: string;
};

/**
 * Triggers the PIN prompt on the customer's handset.
 *
 * A resolved promise means Safaricom accepted the request, NOT that the
 * customer paid — payment confirmation only arrives on the callback URL.
 */
export async function initiateStkPush(params: {
  /** Whole shillings. Daraja rejects decimals. */
  amount: number;
  phone: string;
  /** Shown on the customer's M-PESA statement; keep under 12 chars. */
  accountReference: string;
  description: string;
}): Promise<StkPushResult> {
  const config = getMpesaConfig();
  const phone = normalizeKenyanPhone(params.phone);
  if (!phone) {
    throw new Error(`Not a valid Kenyan mobile number: ${params.phone}`);
  }

  const timestamp = darajaTimestamp();
  const password = Buffer.from(
    `${config.shortCode}${config.passkey}${timestamp}`,
  ).toString("base64");

  const token = await getAccessToken(config);

  const response = await fetch(
    `${config.baseUrl}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        BusinessShortCode: config.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.max(1, Math.round(params.amount)),
        PartyA: phone,
        PartyB: config.shortCode,
        PhoneNumber: phone,
        CallBackURL: config.callbackUrl,
        AccountReference: params.accountReference.slice(0, 12),
        TransactionDesc: params.description.slice(0, 13),
      }),
    },
  );

  const data = (await response.json()) as Record<string, string>;

  if (!response.ok || data.ResponseCode !== "0") {
    throw new Error(
      data.errorMessage ??
        data.CustomerMessage ??
        `M-PESA STK push failed (${response.status})`,
    );
  }

  return {
    merchantRequestId: data.MerchantRequestID,
    checkoutRequestId: data.CheckoutRequestID,
    customerMessage: data.CustomerMessage,
  };
}
