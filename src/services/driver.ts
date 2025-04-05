import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE } from './cache';

export const getDriver = async (driverNumber: string) => {
  const key = `drivers_driver_number_${driverNumber}`
  const redis = Redis.fromEnv();
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "drivers";
  const QUERIES = `?driver_number=${driverNumber}`;
  try {
    const result = await redis.get(key);
    const parsedResult = result && typeof result === "string"  ? JSON.parse(result) as CachedData : result as CachedData;
    if (parsedResult && parsedResult.query === API_ENDPOINT + SERVICE + QUERIES) {
      return parsedResult.data;
    }
    const response = await fetch(API_ENDPOINT + SERVICE + QUERIES, {
      cache: "force-cache",
    });
    const responseData = {query: API_ENDPOINT + SERVICE + QUERIES, data: null}
    const racesData = await response.json();
    responseData.query = API_ENDPOINT + SERVICE + QUERIES;
    responseData.data = racesData.at(0);
    await redis.set(key, JSON.stringify(responseData), {ex: TTL_CACHE});

    return racesData.at(0);
  } catch (error) {
    console.error(error);
  }
  return null;
};
