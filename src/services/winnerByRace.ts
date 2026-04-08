import { getDriver } from "./driver";
import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE } from "./cache";
import { isSessionLive } from "./isSessionLive";
import { rateLimitedFetch } from "./rateLimiter";
export const getWinnerByRace = async (sessionKey: string) => {
  const key = `position_session_key_${sessionKey}_position_1`;
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const SERVICE = "position";
  const QUERIES = `?session_key=${sessionKey}&position=1`;
  let racesData = [];
  const redis = Redis.fromEnv();
  try {
    const live = await isSessionLive(sessionKey);
    if (!live) {
      const result = await redis.get(key);
      const parsedResult = result && typeof result === "string" ? JSON.parse(result) as CachedData : result as CachedData;
      if (parsedResult && parsedResult.query === API_ENDPOINT + SERVICE + QUERIES) {
        racesData = parsedResult.data;
      } else {
        const response = await rateLimitedFetch(API_ENDPOINT + SERVICE + QUERIES, {
          next: { revalidate: 3600, tags: ["winners"] },
        });
        racesData = await response.json();

        const responseData = { query: API_ENDPOINT + SERVICE + QUERIES, data: null };
        responseData.query = API_ENDPOINT + SERVICE + QUERIES;
        responseData.data = racesData;
        await redis.set(key, JSON.stringify(responseData), { ex: TTL_CACHE });
      }
    } else {
      const response = await rateLimitedFetch(API_ENDPOINT + SERVICE + QUERIES, {
        next: { revalidate: 3600, tags: ["winners"] },
      });
      racesData = await response.json();
    }
  } catch (error) {
    console.error(error);
  }



  let driver = null;
  let winnerDriver = null;
  if (racesData && racesData.length > 0) {
    winnerDriver = racesData.at(-1);
    driver = await getDriver(winnerDriver.driver_number, sessionKey);
  }

  return {
    ...winnerDriver,
    driver,
  };
};
