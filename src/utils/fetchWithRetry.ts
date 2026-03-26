// HTTP status codes that are safe to retry (rate limit + server errors)
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

/**
 * Wraps fetch with exponential-backoff retry logic.
 * Retries on network failures and RETRYABLE_STATUSES.
 * Delays: 500 ms → 1 000 ms → 2 000 ms (maxRetries = 3).
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Return immediately on success or a non-retryable error status
      if (response.ok || !RETRYABLE_STATUSES.has(response.status)) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (err) {
      // Network-level failure (DNS, timeout, etc.)
      lastError = err;
    }

    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 500; // 500 ms, 1 000 ms, 2 000 ms
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
