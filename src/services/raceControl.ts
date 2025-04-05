import { RaceControlTypeItem } from "@/types/RaceControlItem";
import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE } from './cache';
export const getRaceControlBySession = async (
  sessionKey: string
): Promise<RaceControlTypeItem[]> => {
  const key = `race_control_session_key_${sessionKey}`
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "race_control";
  const QUERIES = `?session_key=${sessionKey}`;
  const redis = Redis.fromEnv();
  try {
    const result = await redis.get(key);
    const parsedResult = result && typeof result === "string"  ? JSON.parse(result) as CachedData : result as CachedData;
    if (parsedResult && parsedResult.query === API_ENDPOINT + SERVICE + QUERIES) {
      return parsedResult.data;
    }
    const response = await fetch(API_ENDPOINT + SERVICE + QUERIES);
    const raceControlData = await response.json();

    const responseData = {query: API_ENDPOINT + SERVICE + QUERIES, data: null}
    responseData.query = API_ENDPOINT + SERVICE + QUERIES;
    responseData.data = raceControlData;
    await redis.set(key, JSON.stringify(responseData), {ex: TTL_CACHE});

    return raceControlData;
  } catch (error) {
    console.error(error);
  }
  return [];
};
