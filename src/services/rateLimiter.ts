/**
 * Rate limiter for OpenF1 API:
 *   - Max 3 requests per second
 *   - Max 30 requests per minute
 *
 * Uses Redis time-bucketed counters so limits are enforced across all
 * Cloudflare Worker instances (unlike the previous in-memory approach,
 * which reset on every cold start / new isolate).
 *
 * On a 429 response the fetch is retried with exponential backoff up to
 * MAX_RETRIES times, honouring the Retry-After header when present.
 */

import { Redis } from '@upstash/redis';

const MAX_PER_SECOND = 3;
const MAX_PER_MINUTE = 30;
const MAX_RETRIES = 5;

async function acquireSlot(redis: Redis): Promise<void> {
  const now = Date.now();
  const secondKey = `rl:s:${Math.floor(now / 1_000)}`;
  const minuteKey = `rl:m:${Math.floor(now / 60_000)}`;

  // Atomically increment both counters in a single pipeline round-trip
  const [perSecond, , perMinute] = (await redis
    .pipeline()
    .incr(secondKey)
    .expire(secondKey, 2)
    .incr(minuteKey)
    .expire(minuteKey, 120)
    .exec()) as [number, number, number, number];

  if (perSecond > MAX_PER_SECOND || perMinute > MAX_PER_MINUTE) {
    // Release the slot we just claimed
    await redis.pipeline().decr(secondKey).decr(minuteKey).exec();

    // Wait until the limiting bucket rolls over
    const waitMs =
      perSecond > MAX_PER_SECOND
        ? 1_000 - (now % 1_000) + 50
        : 60_000 - (now % 60_000) + 50;

    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return acquireSlot(redis);
  }
}

export async function rateLimitedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const redis = Redis.fromEnv();
  await acquireSlot(redis);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(url, options);

    if (response.status !== 429) {
      return response;
    }

    // Honour Retry-After when provided, otherwise use exponential backoff
    const retryAfter = response.headers.get('Retry-After');
    const waitMs = retryAfter
      ? parseInt(retryAfter, 10) * 1_000
      : Math.min(500 * Math.pow(2, attempt), 30_000);

    console.warn(
      `[rateLimiter] 429 on attempt ${attempt + 1}/${MAX_RETRIES}. Retrying in ${waitMs}ms.`
    );
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    await acquireSlot(redis);
  }

  throw new Error(
    `[rateLimiter] Rate limited: max retries (${MAX_RETRIES}) exceeded for ${url}`
  );
}
