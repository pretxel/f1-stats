import { currentYear } from "@/utils/constants";
import { Redis } from '@upstash/redis';
import { CachedData, TTL_CACHE } from "./cache";

interface GetRaceType {
  sessionKey?: string;
  sessionType?: string;
  year?: number;
}

export const getRaces = async (params: GetRaceType) => {
  const year = params.year ?? currentYear;
  let key = `racesResponse_year_${year}`;
  const API_ENDPOINT = process.env.API_ENDPOINT;
  const redis = Redis.fromEnv();

  const SERVICE = "sessions";
  let QUERIES = `?year=${year}`;
  if (params.sessionKey) {
    QUERIES += "&session_key=" + params.sessionKey;
    key = `racesResponse_session_key_${params.sessionKey}`;
  }
  if (params.sessionType) {
    QUERIES += "&session_type=" + params.sessionType;
    key = `racesResponse_session_type_${params.sessionType}_${year}`;
  }
  try {
    const result = await redis.get(key);
    const parsedResult = result && typeof result === "string"  ? JSON.parse(result) as CachedData : result as CachedData;
    if (parsedResult && parsedResult.query === API_ENDPOINT + SERVICE + QUERIES) {
      return parsedResult.data;
    }
    const response = await fetch(API_ENDPOINT + SERVICE + QUERIES);
    
    // Check if response is ok (status in 200-299 range)
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = {query: API_ENDPOINT + SERVICE + QUERIES, data: null}
    const racesData = await response.json();
    responseData.query = API_ENDPOINT + SERVICE + QUERIES;
    responseData.data = racesData
    await redis.set(key, JSON.stringify(responseData), {ex: TTL_CACHE});

    return racesData;
  } catch (error) {
    console.error("Error fetching races:", error);
    // You might want to handle different types of errors differently
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON response");
    }
    // Re-throw the error if you want to handle it in the calling code
    throw error;
  }
};
