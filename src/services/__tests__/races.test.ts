import { getRaces } from "../races";

// Jest hoists jest.mock calls above imports. Using jest.fn() inline avoids
// the "Cannot access before initialization" temporal dead zone issue.
jest.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: jest.fn().mockReturnValue({
      get: jest.fn(),
      set: jest.fn(),
    }),
  },
}));

jest.mock("../rateLimiter", () => ({
  rateLimitedFetch: jest.fn(),
}));

import { Redis } from "@upstash/redis";
import { rateLimitedFetch } from "../rateLimiter";

const getRedis = () => (Redis.fromEnv as jest.Mock)();

const API_ENDPOINT = "https://api.test/";
const CURRENT_YEAR = new Date().getFullYear();

beforeEach(() => {
  process.env.API_ENDPOINT = API_ENDPOINT;
  // Reset inner mock functions before each test
  const redis = getRedis();
  (redis.get as jest.Mock).mockReset();
  (redis.set as jest.Mock).mockReset();
  (rateLimitedFetch as jest.Mock).mockReset();
});

describe("getRaces", () => {
  const sampleRaces = [
    {
      session_key: "9507",
      date_start: "2024-03-02T14:00:00",
      date_end: "2024-03-02T16:00:00",
      location: "Bahrain",
      session_type: "Race",
    },
  ];

  describe("cache hit", () => {
    it("returns data from Redis when cache key matches the query URL", async () => {
      const cachedData = {
        query: `${API_ENDPOINT}sessions?year=${CURRENT_YEAR}`,
        data: sampleRaces,
      };
      getRedis().get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await getRaces({});

      expect(result).toEqual(sampleRaces);
      expect(rateLimitedFetch).not.toHaveBeenCalled();
    });

    it("returns data from Redis when session key param matches", async () => {
      const sessionKey = "9507";
      const cachedData = {
        query: `${API_ENDPOINT}sessions?year=${CURRENT_YEAR}&session_key=${sessionKey}`,
        data: sampleRaces,
      };
      getRedis().get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await getRaces({ sessionKey });

      expect(result).toEqual(sampleRaces);
      expect(rateLimitedFetch).not.toHaveBeenCalled();
    });

    it("returns data from Redis when session type param matches", async () => {
      const sessionType = "Race";
      const cachedData = {
        query: `${API_ENDPOINT}sessions?year=${CURRENT_YEAR}&session_type=${sessionType}`,
        data: sampleRaces,
      };
      getRedis().get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await getRaces({ sessionType });

      expect(result).toEqual(sampleRaces);
      expect(rateLimitedFetch).not.toHaveBeenCalled();
    });

    it("returns data directly when Redis returns an object (not a string)", async () => {
      const cachedData = {
        query: `${API_ENDPOINT}sessions?year=${CURRENT_YEAR}`,
        data: sampleRaces,
      };
      getRedis().get.mockResolvedValue(cachedData);

      const result = await getRaces({});

      expect(result).toEqual(sampleRaces);
      expect(rateLimitedFetch).not.toHaveBeenCalled();
    });
  });

  describe("cache miss → API fetch", () => {
    it("fetches from API when Redis returns null, caches the result", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(sampleRaces),
      });

      const result = await getRaces({});

      expect(result).toEqual(sampleRaces);
      expect(rateLimitedFetch).toHaveBeenCalledWith(
        `${API_ENDPOINT}sessions?year=${CURRENT_YEAR}`
      );
      expect(getRedis().set).toHaveBeenCalledWith(
        `racesResponse_year_${CURRENT_YEAR}`,
        expect.stringContaining('"data"'),
        { ex: 86400 }
      );
    });

    it("uses session_key Redis key when sessionKey param is provided", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(sampleRaces),
      });

      await getRaces({ sessionKey: "9507" });

      expect(rateLimitedFetch).toHaveBeenCalledWith(
        `${API_ENDPOINT}sessions?year=${CURRENT_YEAR}&session_key=9507`
      );
      expect(getRedis().set).toHaveBeenCalledWith(
        "racesResponse_session_key_9507",
        expect.any(String),
        { ex: 86400 }
      );
    });

    it("uses session_type Redis key when sessionType param is provided", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(sampleRaces),
      });

      await getRaces({ sessionType: "Race" });

      expect(rateLimitedFetch).toHaveBeenCalledWith(
        `${API_ENDPOINT}sessions?year=${CURRENT_YEAR}&session_type=Race`
      );
      expect(getRedis().set).toHaveBeenCalledWith(
        "racesResponse_session_type_Race",
        expect.any(String),
        { ex: 86400 }
      );
    });

    it("ignores stale cache entry when the stored query URL doesn't match current params", async () => {
      const staleCache = {
        query: "https://old-api.test/sessions?year=2023",
        data: [],
      };
      getRedis().get.mockResolvedValue(JSON.stringify(staleCache));
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(sampleRaces),
      });

      const result = await getRaces({});

      expect(result).toEqual(sampleRaces);
      expect(rateLimitedFetch).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("throws when API returns a non-ok response", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue("Internal Server Error"),
      });

      await expect(getRaces({})).rejects.toThrow("API Error: 500");
    });

    it("throws when the fetch itself fails (network error)", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockRejectedValue(new Error("Network failure"));

      await expect(getRaces({})).rejects.toThrow("Network failure");
    });

    it("throws when Redis get fails", async () => {
      getRedis().get.mockRejectedValue(new Error("Redis connection refused"));

      await expect(getRaces({})).rejects.toThrow("Redis connection refused");
    });
  });
});
