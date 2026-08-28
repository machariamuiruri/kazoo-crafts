import "server-only";
import { kvConfig, kvIsConfigured, kvPipeline, type KvConfig } from "@/lib/kv";

/**
 * Fixed-window rate limiting, backed by Vercel KV / Upstash Redis.
 *
 * ⚠️  WITHOUT KV CONFIGURED THIS FALLS BACK TO IN-MEMORY COUNTERS, WHICH ARE
 *     EFFECTIVELY USELESS ON VERCEL. Each serverless instance gets its own
 *     memory, so an attacker spreading requests across instances bypasses the
 *     limit entirely, and counters reset on every cold start. The fallback
 *     exists so local development works — it is NOT a production control.
 *     `rateLimitIsDurable()` reports which mode is active.
 */

type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the current window resets. */
  retryAfter: number;
};

/** True when a shared store is configured, i.e. limits actually hold. */
export function rateLimitIsDurable(): boolean {
  return kvIsConfigured();
}

/* ------------------------------------------------------------------ */
/* In-memory fallback (development only)                               */
/* ------------------------------------------------------------------ */

const memory = new Map<string, { count: number; expiresAt: number }>();

function memoryLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  const entry = memory.get(key);

  if (!entry || entry.expiresAt <= now) {
    memory.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count += 1;
  const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);

  // Opportunistic cleanup so the map can't grow without bound.
  if (memory.size > 10_000) {
    for (const [k, v] of memory) if (v.expiresAt <= now) memory.delete(k);
  }

  return { allowed: entry.count <= limit, retryAfter };
}

/* ------------------------------------------------------------------ */
/* Redis-backed limiter                                                */
/* ------------------------------------------------------------------ */

async function redisLimit(
  config: KvConfig,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  // INCR, then set the TTL only if the key doesn't already have one (EXPIRE NX)
  // so a busy window isn't repeatedly extended into a rolling block.
  const results = await kvPipeline(config, [
    ["INCR", key],
    ["EXPIRE", key, windowSeconds, "NX"],
    ["TTL", key],
  ]);

  const count = Number(results[0] ?? 0);
  const ttl = Number(results[2] ?? windowSeconds);

  return {
    allowed: count <= limit,
    retryAfter: ttl > 0 ? ttl : windowSeconds,
  };
}

/* ------------------------------------------------------------------ */

/**
 * Consumes one unit against `key`.
 *
 * Fails **open** if the Redis call errors: a rate limiter outage shouldn't take
 * checkout down with it. That is a deliberate availability-over-security
 * trade-off — if you'd rather fail closed, invert the catch below.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const config = kvConfig();
  if (!config) return memoryLimit(key, limit, windowSeconds);

  try {
    return await redisLimit(config, key, limit, windowSeconds);
  } catch (error) {
    console.error("[rate-limit] store unavailable, allowing request", error);
    return { allowed: true, retryAfter: 0 };
  }
}

/** Limits applied to the checkout endpoints. */
export const LIMITS = {
  /** Per client IP, across all checkout attempts. */
  perIp: { limit: 10, windowSeconds: 600 },
  /**
   * Per destination phone number. This is the important one: without it the
   * STK Push endpoint can be used to spray real PIN prompts at arbitrary
   * handsets, which is harassment carried out with your paybill.
   */
  perPhone: { limit: 3, windowSeconds: 600 },
} as const;
