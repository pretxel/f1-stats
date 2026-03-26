import { getDriver } from "./driver";
import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE, TTL_LIVE } from "./cache";
import { isSessionLive } from "./isSessionLive";
import { fetchWithRetry } from "@/utils/fetchWithRetry";

export const getWinnerByRace = async (sessionKey: string) => {
  const key = `position_session_key_${sessionKey}_position_1`;
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "position";
  const QUERIES = `?session_key=${sessionKey}&position<=1`;
  let racesData = [];
  const redis = Redis.fromEnv();
  try {
    const live = await isSessionLive(sessionKey);

    // Always check cache first.
    // Live sessions write with TTL_LIVE (30 s) so fresh position data is
    // fetched at most once per 30 s rather than on every page render.
    const result = await redis.get(key);
    const parsedResult =
      result && typeof result === "string"
        ? (JSON.parse(result) as CachedData)
        : (result as CachedData);

    if (parsedResult && parsedResult.query === API_ENDPOINT + SERVICE + QUERIES) {
      racesData = parsedResult.data;
    } else {
      const response = await fetchWithRetry(API_ENDPOINT + SERVICE + QUERIES, {
        next: { revalidate: 3600, tags: ["winners"] },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      racesData = await response.json();

      const ttl = live ? TTL_LIVE : TTL_CACHE;
      await redis.set(
        key,
        JSON.stringify({ query: API_ENDPOINT + SERVICE + QUERIES, data: racesData }),
        { ex: ttl }
      );
    }
  } catch (error) {
    console.error(error);
  }

  const winnerDriver = racesData.at(-1);
  let driver = null;
  if (winnerDriver) {
    driver = await getDriver(winnerDriver.driver_number);
  }

  return {
    ...winnerDriver,
    driver,
  };
};
