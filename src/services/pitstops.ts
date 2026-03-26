import { getDriver } from "./driver";
import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE } from './cache';
import { isSessionLive } from './isSessionLive';
import { rateLimitedFetch } from './rateLimiter';

interface PitstopData {
  driver_number: number;
  driver?: any;
  [key: string]: any;
}

export const getPitstops = async (sessionKey: string) => {
  const key = `pit_session_key_${sessionKey}`
  const redis = Redis.fromEnv();
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "pit";
  const QUERIES = `?session_key=${sessionKey}`;
  let raceControlData: PitstopData[] = [];
  try {
    const live = await isSessionLive(sessionKey);
    if (!live) {
      const result = await redis.get(key);
      const parsedResult = result && typeof result === "string"  ? JSON.parse(result) as CachedData : result as CachedData;
      if (parsedResult && parsedResult.query === API_ENDPOINT + SERVICE + QUERIES) {
        return parsedResult.data;
      }
    }

    

    const response = await rateLimitedFetch(API_ENDPOINT + SERVICE + QUERIES);

    raceControlData = await response.json();

    // Fetch each unique driver once in parallel, then attach to all matching pitstops
    const uniqueDriverNumbers = [...new Set(raceControlData.map((p) => p.driver_number))];
    const driverMap = new Map<number, any>();
    await Promise.all(
      uniqueDriverNumbers.map(async (driverNumber) => {
        driverMap.set(driverNumber, await getDriver(driverNumber));
      })
    );
    raceControlData = raceControlData.map((p) => ({ ...p, driver: driverMap.get(p.driver_number) }));

    const responseData: CachedData = {query: API_ENDPOINT + SERVICE + QUERIES, data: null}
    responseData.query = API_ENDPOINT + SERVICE + QUERIES;
    responseData.data = raceControlData;
    if (!live) {
      await redis.set(key, JSON.stringify(responseData), {ex: TTL_CACHE});
    }

  } catch (error) {
    console.error(error);
  }


  return raceControlData;
};
