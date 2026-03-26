import { getDriver } from "./driver";
import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE, TTL_LIVE } from './cache';
import { isSessionLive } from './isSessionLive';
import { fetchWithRetry } from '@/utils/fetchWithRetry';

interface PitstopData {
  driver_number: number;
  driver?: any;
  [key: string]: any;
}

export const getPitstops = async (sessionKey: string) => {
  const key = `pit_session_key_${sessionKey}`;
  const redis = Redis.fromEnv();
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "pit";
  const QUERIES = `?session_key=${sessionKey}`;
  let raceControlData: PitstopData[] = [];
  try {
    const live = await isSessionLive(sessionKey);

    // Always check cache first.
    // Live sessions write with TTL_LIVE (30 s) so stale entries expire quickly
    // while still protecting the API from hammering on every render.
    const result = await redis.get(key);
    const parsedResult =
      result && typeof result === "string"
        ? (JSON.parse(result) as CachedData)
        : (result as CachedData);
    if (parsedResult && parsedResult.query === API_ENDPOINT + SERVICE + QUERIES) {
      return parsedResult.data;
    }

    const response = await fetchWithRetry(API_ENDPOINT + SERVICE + QUERIES);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    raceControlData = await response.json();

    // Deduplicate driver numbers and fetch all in parallel.
    // React.cache() in getDriver() ensures each unique driver is only fetched
    // once per render, even if multiple pit stops share the same driver.
    const uniqueDriverNumbers = [
      ...new Set(raceControlData.map((p) => p.driver_number)),
    ];
    const driverEntries = await Promise.all(
      uniqueDriverNumbers.map(async (num) => [num, await getDriver(num)] as const)
    );
    const driverMap = new Map(driverEntries);

    raceControlData = raceControlData.map((pitstop) => ({
      ...pitstop,
      driver: driverMap.get(pitstop.driver_number),
    }));

    const ttl = live ? TTL_LIVE : TTL_CACHE;
    await redis.set(
      key,
      JSON.stringify({ query: API_ENDPOINT + SERVICE + QUERIES, data: raceControlData }),
      { ex: ttl }
    );
  } catch (error) {
    console.error(error);
  }

  return raceControlData;
};
