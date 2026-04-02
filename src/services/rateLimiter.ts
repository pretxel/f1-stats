/**
 * Rate limiter for OpenF1 API:
 *   - Max 3 requests per second
 *   - Max 30 requests per minute
 *
 * Uses a Lua script executed atomically in Redis so the check-and-increment is
 * a single operation — no race conditions across Cloudflare Worker instances.
 *
 * Slot acquisition is iterative (not recursive) with random jitter to prevent
 * a thundering-herd when many workers become unblocked at the same moment.
 *
 * On a 429 response the fetch is retried with exponential backoff + jitter up
 * to MAX_RETRIES times, honouring the Retry-After header when present.
 */

import { Redis } from '@upstash/redis';

const MAX_PER_SECOND = 3;
const MAX_PER_MINUTE = 30;
const MAX_RETRIES = 5;
const MAX_SLOT_ATTEMPTS = 20;

/**
 * Atomically checks both rate-limit counters and, only if both are under their
 * caps, increments them and sets their TTL in the same Lua transaction.
 *
 * Returns 1 when the slot is granted, 0 when the caller must wait.
 */
const ACQUIRE_SCRIPT = `
local second_key = KEYS[1]
local minute_key = KEYS[2]
local max_per_second = tonumber(ARGV[1])
local max_per_minute = tonumber(ARGV[2])

local per_second = tonumber(redis.call('GET', second_key)) or 0
local per_minute = tonumber(redis.call('GET', minute_key)) or 0

if per_second >= max_per_second or per_minute >= max_per_minute then
  return 0
end

redis.call('INCR', second_key)
redis.call('EXPIRE', second_key, 2)
redis.call('INCR', minute_key)
redis.call('EXPIRE', minute_key, 120)
return 1
`;

// Lazily initialised singleton — avoids reconstructing the client on every call.
let _redis: Redis | null = null;
function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv();
  return _redis;
}

async function acquireSlot(): Promise<void> {
  const redis = getRedis();

  for (let attempt = 0; attempt < MAX_SLOT_ATTEMPTS; attempt++) {
    const now = Date.now();
    const secondKey = `rl:s:${Math.floor(now / 1_000)}`;
    const minuteKey = `rl:m:${Math.floor(now / 60_000)}`;

    const acquired = await redis.eval(
      ACQUIRE_SCRIPT,
      [secondKey, minuteKey],
      [String(MAX_PER_SECOND), String(MAX_PER_MINUTE)]
    );

    if (acquired === 1) return;

    // Wait until the current second bucket rolls over, plus random jitter so
    // workers don't all retry simultaneously (thundering herd).
    const jitterMs = Math.random() * 100;
    const waitMs = 1_000 - (Date.now() % 1_000) + 50 + jitterMs;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  throw new Error(
    `[rateLimiter] Could not acquire rate limit slot after ${MAX_SLOT_ATTEMPTS} attempts`
  );
}

export async function rateLimitedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  await acquireSlot();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(url, options);

    if (response.status !== 429) {
      return response;
    }

    // Honour Retry-After when provided, otherwise use exponential backoff + jitter.
    const retryAfter = response.headers.get('Retry-After');
    const baseWait = retryAfter
      ? parseInt(retryAfter, 10) * 1_000
      : Math.min(500 * Math.pow(2, attempt), 30_000);
    const waitMs = baseWait + Math.random() * 500;

    console.warn(
      `[rateLimiter] 429 on attempt ${attempt + 1}/${MAX_RETRIES}. Retrying in ${Math.round(waitMs)}ms.`
    );
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    await acquireSlot();
  }

  throw new Error(
    `[rateLimiter] Rate limited: max retries (${MAX_RETRIES}) exceeded for ${url}`
  );
}
