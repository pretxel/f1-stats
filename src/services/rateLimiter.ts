/**
 * Rate limiter for OpenF1 API:
 *   - Max 3 requests per second
 *   - Max 30 requests per minute
 */

const MAX_PER_SECOND = 3;
const MAX_PER_MINUTE = 30;

let timestamps: number[] = [];

async function waitForSlot(): Promise<void> {
  const now = Date.now();

  // Prune timestamps outside the 1-minute window
  timestamps = timestamps.filter((t) => now - t < 60_000);

  const withinLastSecond = timestamps.filter((t) => now - t < 1_000);

  if (withinLastSecond.length >= MAX_PER_SECOND) {
    // Wait until the oldest per-second timestamp falls out of the 1s window
    const waitMs = 1_000 - (now - withinLastSecond[0]) + 1;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return waitForSlot();
  }

  if (timestamps.length >= MAX_PER_MINUTE) {
    // Wait until the oldest per-minute timestamp falls out of the 60s window
    const waitMs = 60_000 - (now - timestamps[0]) + 1;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return waitForSlot();
  }

  timestamps.push(Date.now());
}

export async function rateLimitedFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  await waitForSlot();
  return fetch(url, options);
}
