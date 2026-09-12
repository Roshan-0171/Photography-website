/**
 * Per-IP sliding-window rate limit, with no new dependencies.
 *
 * Two stores:
 *   - In-memory (default). Correct on a single long-lived server. On serverless
 *     each instance keeps its own counters, so the effective limit is
 *     `max × instances` — fine for a low-traffic site, not a hard guarantee.
 *   - Upstash Redis, used automatically when UPSTASH_REDIS_REST_URL and
 *     UPSTASH_REDIS_REST_TOKEN are set. Spoken to over plain fetch, so it costs
 *     no dependency. This is the one to use once the site is deployed.
 *
 * The window truly slides: we keep one timestamp per attempt and drop anything
 * older than the window, rather than resetting a counter on a fixed boundary.
 */

const WINDOW_MS =
  Number(process.env.RATE_LIMIT_WINDOW_MINUTES ?? 60) * 60 * 1000;
const MAX = Number(process.env.RATE_LIMIT_MAX ?? 5);

export type RateLimitVerdict = {
  allowed: boolean;
  /** Attempts left in the current window, after counting this one. */
  remaining: number;
};

// --- in-memory store -------------------------------------------------------

const hits = new Map<string, number[]>();
let lastSweep = 0;

/** Drop keys nobody has touched for a full window so the map cannot grow forever. */
function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [key, times] of hits) {
    if (times.every((t) => t <= now - WINDOW_MS)) hits.delete(key);
  }
}

function checkMemory(key: string, now: number): RateLimitVerdict {
  sweep(now);
  const cutoff = now - WINDOW_MS;
  const times = (hits.get(key) ?? []).filter((t) => t > cutoff);
  times.push(now);
  hits.set(key, times);
  return { allowed: times.length <= MAX, remaining: Math.max(0, MAX - times.length) };
}

// --- Upstash Redis store ---------------------------------------------------

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function checkUpstash(key: string, now: number): Promise<RateLimitVerdict> {
  const k = `ratelimit:${key}`;
  const member = `${now}-${Math.random().toString(36).slice(2, 10)}`;

  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["ZREMRANGEBYSCORE", k, 0, now - WINDOW_MS],
      ["ZADD", k, now, member],
      ["ZCARD", k],
      ["PEXPIRE", k, WINDOW_MS],
    ]),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Upstash responded ${res.status}`);

  const parsed = (await res.json()) as { result: number }[];
  const count = Number(parsed[2]?.result ?? 0);
  return { allowed: count <= MAX, remaining: Math.max(0, MAX - count) };
}

// --- public API ------------------------------------------------------------

export async function rateLimit(key: string): Promise<RateLimitVerdict> {
  const now = Date.now();

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      return await checkUpstash(key, now);
    } catch (error) {
      // A rate limiter that is down must not take the contact form down with
      // it. Fall through to the in-process counter rather than rejecting.
      console.error("[rate-limit] Upstash unavailable, falling back to memory", error);
    }
  }

  return checkMemory(key, now);
}

/**
 * Best-effort client IP. Behind Vercel/Netlify/Cloudflare the proxy sets
 * x-forwarded-for; the left-most entry is the original client.
 *
 * There is no such header when running locally, so every local submission
 * shares the key "local" — expect to hit the limit while testing, and raise
 * RATE_LIMIT_MAX when you need to submit repeatedly.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "local";
}
