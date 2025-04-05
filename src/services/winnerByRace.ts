import { getDriver } from "./driver";
import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE } from "./cache";
export const getWinnerByRace = async (sessionKey: string) => {
  const key = `position_session_key_${sessionKey}_position_1`
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "position";
  const QUERIES = `?session_key=${sessionKey}&position<=1`;
  let racesData = [];
  const redis = Redis.fromEnv();
  try {
    const result = await redis.get(key);
    const parsedResult = result && typeof result === "string"  ? JSON.parse(result) as CachedData : result as CachedData;
    if (parsedResult && parsedResult.query === API_ENDPOINT + SERVICE + QUERIES) {
      racesData = parsedResult.data;
    } else {

      const response = await fetch(API_ENDPOINT + SERVICE + QUERIES, {
        next: { revalidate: 3600, tags: ["winners"] },
      });
      racesData = await response.json();

      const responseData = {query: API_ENDPOINT + SERVICE + QUERIES, data: null}
      responseData.query = API_ENDPOINT + SERVICE + QUERIES;
      responseData.data = racesData
      await redis.set(key, JSON.stringify(responseData), {ex: TTL_CACHE});
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
