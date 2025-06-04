import { getDriver } from "./driver";
import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE } from './cache';

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
    const result = await redis.get(key);
    const parsedResult = result && typeof result === "string"  ? JSON.parse(result) as CachedData : result as CachedData;
    if (parsedResult && parsedResult.query === API_ENDPOINT + SERVICE + QUERIES) {
      return parsedResult.data;
    }

    

    const response = await fetch(API_ENDPOINT + SERVICE + QUERIES);

    raceControlData = await response.json();
    for (let i = 0; i < raceControlData.length; i++) {
      const driver = await getDriver(raceControlData[i].driver_number);
      raceControlData[i] = { ...raceControlData[i], driver };
    }

    const responseData = {query: API_ENDPOINT + SERVICE + QUERIES, data: null}
    responseData.query = API_ENDPOINT + SERVICE + QUERIES;
    responseData.data = raceControlData;
    await redis.set(key, JSON.stringify(responseData), {ex: TTL_CACHE});

  } catch (error) {
    console.error(error);
  }


  return raceControlData;
};
