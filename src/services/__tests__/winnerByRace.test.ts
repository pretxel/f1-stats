import { getWinnerByRace } from "../winnerByRace";

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

jest.mock("../isSessionLive", () => ({
  isSessionLive: jest.fn(),
}));

jest.mock("../driver", () => ({
  getDriver: jest.fn(),
}));

import { Redis } from "@upstash/redis";
import { rateLimitedFetch } from "../rateLimiter";
import { isSessionLive } from "../isSessionLive";
import { getDriver } from "../driver";

const getRedis = () => (Redis.fromEnv as jest.Mock)();

const API_ENDPOINT = "https://api.test/";
const SESSION_KEY = "9507";

const samplePositionData = [
  { driver_number: 44, position: 1, date: "2024-03-02T14:00:00" },
  { driver_number: 44, position: 1, date: "2024-03-02T16:00:00" },
];

const winnerDriver = {
  driver_number: 44,
  full_name: "Lewis Hamilton",
  name_acronym: "HAM",
};

beforeEach(() => {
  process.env.API_ENDPOINT = API_ENDPOINT;
  const redis = getRedis();
  (redis.get as jest.Mock).mockReset();
  (redis.set as jest.Mock).mockReset();
  (rateLimitedFetch as jest.Mock).mockReset();
  (isSessionLive as jest.Mock).mockReset();
  (getDriver as jest.Mock).mockReset();
});

describe("getWinnerByRace", () => {
  describe("session is not live — cache path", () => {
    beforeEach(() => {
      (isSessionLive as jest.Mock).mockResolvedValue(false);
    });

    it("returns winner with driver data from cache", async () => {
      const QUERIES = `?session_key=${SESSION_KEY}&position<=1`;
      const cachedData = {
        query: `${API_ENDPOINT}position${QUERIES}`,
        data: samplePositionData,
      };
      getRedis().get.mockResolvedValue(JSON.stringify(cachedData));
      (getDriver as jest.Mock).mockResolvedValue(winnerDriver);

      const result = await getWinnerByRace(SESSION_KEY);

      expect(result.driver_number).toBe(44);
      expect(result.driver).toEqual(winnerDriver);
      expect(rateLimitedFetch).not.toHaveBeenCalled();
    });

    it("fetches from API on cache miss, caches result, and returns winner with driver", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(samplePositionData),
      });
      (getDriver as jest.Mock).mockResolvedValue(winnerDriver);

      const result = await getWinnerByRace(SESSION_KEY);

      expect(result.driver).toEqual(winnerDriver);
      expect(getRedis().set).toHaveBeenCalledWith(
        `position_session_key_${SESSION_KEY}_position_1`,
        expect.stringContaining('"data"'),
        { ex: 86400 }
      );
    });

    it("returns last entry in position data as the winner (latest position record)", async () => {
      const multiplePositions = [
        { driver_number: 1, position: 1, date: "2024-03-02T14:00:00" },
        { driver_number: 44, position: 1, date: "2024-03-02T16:00:00" },
      ];
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(multiplePositions),
      });
      (getDriver as jest.Mock).mockResolvedValue(winnerDriver);

      const result = await getWinnerByRace(SESSION_KEY);

      // at(-1) → last entry
      expect(result.driver_number).toBe(44);
    });
  });

  describe("session is live — always fetches from API", () => {
    beforeEach(() => {
      (isSessionLive as jest.Mock).mockResolvedValue(true);
    });

    it("fetches live data from API and returns winner with driver", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(samplePositionData),
      } as unknown as Response);
      (getDriver as jest.Mock).mockResolvedValue(winnerDriver);

      const result = await getWinnerByRace(SESSION_KEY);

      expect(result.driver).toEqual(winnerDriver);
      expect(getRedis().set).not.toHaveBeenCalled();
    });
  });

  describe("empty race data", () => {
    it("returns object with null driver when no position data exists", async () => {
      (isSessionLive as jest.Mock).mockResolvedValue(false);
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue([]),
      });

      const result = await getWinnerByRace(SESSION_KEY);

      expect(result.driver).toBeNull();
    });
  });

  describe("error handling", () => {
    it("returns object with null driver when fetch throws", async () => {
      (isSessionLive as jest.Mock).mockResolvedValue(false);
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await getWinnerByRace(SESSION_KEY);

      expect(result).toEqual({ driver: null });
    });

    it("returns object with null driver when Redis throws", async () => {
      (isSessionLive as jest.Mock).mockResolvedValue(false);
      getRedis().get.mockRejectedValue(new Error("Redis down"));

      const result = await getWinnerByRace(SESSION_KEY);

      expect(result).toEqual({ driver: null });
    });
  });
});
