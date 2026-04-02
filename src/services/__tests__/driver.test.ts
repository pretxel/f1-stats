import { getDriver } from "../driver";

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

const sampleDriver = {
  driver_number: 44,
  full_name: "Lewis Hamilton",
  name_acronym: "HAM",
  headshot_url: "https://example.com/ham.png",
};

beforeEach(() => {
  process.env.API_ENDPOINT = API_ENDPOINT;
  const redis = getRedis();
  (redis.get as jest.Mock).mockReset();
  (redis.set as jest.Mock).mockReset();
  (rateLimitedFetch as jest.Mock).mockReset();
});

describe("getDriver", () => {
  describe("cache hit", () => {
    it("returns driver data from Redis when cache matches the query URL", async () => {
      const cachedData = {
        query: `${API_ENDPOINT}drivers?driver_number=44`,
        data: sampleDriver,
      };
      getRedis().get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await getDriver(44);

      expect(result).toEqual(sampleDriver);
      expect(rateLimitedFetch).not.toHaveBeenCalled();
    });

    it("works with a string driver number", async () => {
      const cachedData = {
        query: `${API_ENDPOINT}drivers?driver_number=44`,
        data: sampleDriver,
      };
      getRedis().get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await getDriver("44");

      expect(result).toEqual(sampleDriver);
    });

    it("returns driver data when Redis returns an object (not a string)", async () => {
      const cachedData = {
        query: `${API_ENDPOINT}drivers?driver_number=44`,
        data: sampleDriver,
      };
      getRedis().get.mockResolvedValue(cachedData);

      const result = await getDriver(44);

      expect(result).toEqual(sampleDriver);
    });
  });

  describe("cache miss → API fetch", () => {
    it("fetches from API, returns first element, and caches the result", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue([sampleDriver]),
      });

      const result = await getDriver(44);

      expect(result).toEqual(sampleDriver);
      expect(rateLimitedFetch).toHaveBeenCalledWith(
        `${API_ENDPOINT}drivers?driver_number=44`,
        { cache: "force-cache" }
      );
      expect(getRedis().set).toHaveBeenCalledWith(
        "drivers_driver_number_44",
        expect.stringContaining('"data"'),
        { ex: 86400 }
      );
    });

    it("returns undefined when API returns an empty array", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue([]),
      });

      const result = await getDriver(99);

      expect(result).toBeUndefined();
    });

    it("ignores stale cache when stored query doesn't match", async () => {
      const staleCache = {
        query: "https://old.api/drivers?driver_number=44",
        data: { driver_number: 44, full_name: "Old Data" },
      };
      getRedis().get.mockResolvedValue(JSON.stringify(staleCache));
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue([sampleDriver]),
      });

      const result = await getDriver(44);

      expect(result).toEqual(sampleDriver);
      expect(rateLimitedFetch).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("returns null when fetch throws", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await getDriver(44);

      expect(result).toBeNull();
    });

    it("returns null when Redis throws", async () => {
      getRedis().get.mockRejectedValue(new Error("Redis down"));

      const result = await getDriver(44);

      expect(result).toBeNull();
    });
  });
});
