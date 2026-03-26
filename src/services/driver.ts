import { cache } from 'react';
import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE } from './cache';
import { fetchWithRetry } from '@/utils/fetchWithRetry';

/**
 * Fetches a single driver by number.
 *
 * Wrapped with React.cache() so that multiple calls with the same driver
 * number within a single server-render pass share one result — eliminating
 * duplicate Redis lookups and API calls for the same driver (e.g. when a
 * driver has several pit stops in a race).
 */
const fetchDriver = cache(async (driverNumber: number | string) => {
  const key = `drivers_driver_number_${driverNumber}`;
  const redis = Redis.fromEnv();
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "drivers";
  const QUERIES = `?driver_number=${driverNumber}`;
  try {
    const result = await redis.get(key);
    const parsedResult =
      result && typeof result === "string"
        ? (JSON.parse(result) as CachedData)
        : (result as CachedData);
    if (parsedResult && parsedResult.query === API_ENDPOINT + SERVICE + QUERIES) {
      return parsedResult.data;
    }

    const response = await fetchWithRetry(API_ENDPOINT + SERVICE + QUERIES, {
      cache: "force-cache",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const racesData = await response.json();
    const driver = racesData.at(0);
    await redis.set(
      key,
      JSON.stringify({ query: API_ENDPOINT + SERVICE + QUERIES, data: driver }),
      { ex: TTL_CACHE }
    );
    return driver;
  } catch (error) {
    console.error(error);
    return null;
  }
});

export const getDriver = fetchDriver;
