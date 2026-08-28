import "server-only";

/**
 * Minimal Vercel KV / Upstash Redis client over the REST API.
 *
 * Deliberately dependency-free — it's a couple of fetch calls, and adding an
 * SDK for that isn't worth the install. Configure with either pair:
 *
 *   KV_REST_API_URL + KV_REST_API_TOKEN                (Vercel KV integration)
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (Upstash directly)
 */

export type KvConfig = { url: string; token: string };

export function kvConfig(): KvConfig | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

/** True when a shared store is configured. */
export function kvIsConfigured(): boolean {
  return kvConfig() !== null;
}

/** Runs a pipeline of Redis commands, returning each result in order. */
export async function kvPipeline(
  config: KvConfig,
  commands: (string | number)[][],
): Promise<unknown[]> {
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(commands.map((c) => c.map(String))),
  });

  if (!response.ok) {
    throw new Error(`KV returned ${response.status}`);
  }

  const results = (await response.json()) as { result: unknown }[];
  return results.map((entry) => entry.result);
}

/* ------------------------------------------------------------------ */

/** In-process fallback for claimOnce when no KV is configured. */
const localClaims = new Map<string, number>();

/**
 * Claims `key` exactly once within `ttlSeconds`.
 *
 * Returns true the first time and false for every repeat — the primitive
 * behind callback idempotency. Uses SET NX, which is atomic, so two callbacks
 * arriving simultaneously can't both win.
 *
 * ⚠️  Without KV configured this falls back to per-instance memory, which does
 *     NOT deduplicate across serverless instances. Configure KV in production.
 */
export async function claimOnce(
  key: string,
  ttlSeconds: number,
): Promise<boolean> {
  const config = kvConfig();

  if (!config) {
    const now = Date.now();
    for (const [k, expiry] of localClaims) {
      if (expiry <= now) localClaims.delete(k);
    }
    if (localClaims.has(key)) return false;
    localClaims.set(key, now + ttlSeconds * 1000);
    return true;
  }

  const [result] = await kvPipeline(config, [
    ["SET", key, "1", "NX", "EX", ttlSeconds],
  ]);
  return result === "OK";
}
