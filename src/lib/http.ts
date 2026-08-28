import "server-only";

/**
 * Maximum accepted request body, in bytes.
 *
 * A legitimate checkout payload is a few hundred bytes. App Router route
 * handlers have no built-in body limit, so without this an attacker can stream
 * an unbounded body and hold a function open until it times out.
 */
const MAX_BODY_BYTES = 16 * 1024;

export type BodyResult<T> =
  | { ok: true; body: T }
  | { ok: false; status: number; error: string };

/**
 * Reads and parses a JSON request body, rejecting anything oversized.
 *
 * Checks Content-Length first (cheap, catches honest clients) and then measures
 * the body actually received, because Content-Length can be absent on chunked
 * requests or simply lie.
 */
export async function readJsonBody<T = Record<string, unknown>>(
  request: Request,
): Promise<BodyResult<T>> {
  const declared = request.headers.get("content-length");
  if (declared && Number(declared) > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "Request too large." };
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { ok: false, status: 400, error: "Could not read request." };
  }

  if (raw.length > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "Request too large." };
  }

  try {
    return { ok: true, body: JSON.parse(raw) as T };
  } catch {
    return { ok: false, status: 400, error: "Malformed request." };
  }
}

/**
 * Best-effort client IP.
 *
 * On Vercel, `x-forwarded-for` is set by the platform and its left-most entry
 * is the real client. Behind any other proxy this header is trivially spoofed,
 * so never use it for authorisation on its own — only for rate-limit keying
 * and coarse allowlisting.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}
