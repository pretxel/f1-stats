import { RaceControlTypeItem } from "@/types/RaceControlItem";
import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE, TTL_LIVE } from './cache';
import { isSessionLive } from './isSessionLive';
import { fetchWithRetry } from '@/utils/fetchWithRetry';

export const getRaceControlBySession = async (
  sessionKey: string
): Promise<RaceControlTypeItem[]> => {
  const key = `race_control_session_key_${sessionKey}`;
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "race_control";
  const QUERIES = `?session_key=${sessionKey}`;
  const redis = Redis.fromEnv();
  try {
    const live = await isSessionLive(sessionKey);

    // Always check cache first.
    // Live sessions are stored with TTL_LIVE (30 s) so entries auto-expire,
    // ensuring fresh data without bypassing the cache on every render.
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
    const raceControlData = await response.json();

    const ttl = live ? TTL_LIVE : TTL_CACHE;
    await redis.set(
      key,
      JSON.stringify({ query: API_ENDPOINT + SERVICE + QUERIES, data: raceControlData }),
      { ex: ttl }
    );

    return raceControlData;
  } catch (error) {
    console.error(error);
  }
  return [];
};
