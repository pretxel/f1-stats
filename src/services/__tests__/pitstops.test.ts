import { getPitstops } from "../pitstops";

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

const samplePitstops = [
  { driver_number: 44, lap_number: 10, pit_duration: "2.5" },
  { driver_number: 55, lap_number: 15, pit_duration: "3.0" },
];

const driverHAM = { driver_number: 44, full_name: "Lewis Hamilton" };
const driverSAI = { driver_number: 55, full_name: "Carlos Sainz" };

beforeEach(() => {
  process.env.API_ENDPOINT = API_ENDPOINT;
  const redis = getRedis();
  (redis.get as jest.Mock).mockReset();
  (redis.set as jest.Mock).mockReset();
  (rateLimitedFetch as jest.Mock).mockReset();
  (isSessionLive as jest.Mock).mockReset();
  (getDriver as jest.Mock).mockReset();
});

describe("getPitstops", () => {
  describe("session is not live — cache path", () => {
    beforeEach(() => {
      (isSessionLive as jest.Mock).mockResolvedValue(false);
    });

    it("returns cached data when cache matches the query URL", async () => {
      const enrichedData = samplePitstops.map((p) => ({
        ...p,
        driver: p.driver_number === 44 ? driverHAM : driverSAI,
      }));
      const cachedData = {
        query: `${API_ENDPOINT}pit?session_key=${SESSION_KEY}`,
        data: enrichedData,
      };
      getRedis().get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await getPitstops(SESSION_KEY);

      expect(result).toEqual(enrichedData);
      expect(rateLimitedFetch).not.toHaveBeenCalled();
    });

    it("fetches from API on cache miss, attaches driver data, and caches result", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(samplePitstops),
      });
      (getDriver as jest.Mock).mockImplementation((num: number) =>
        num === 44 ? Promise.resolve(driverHAM) : Promise.resolve(driverSAI)
      );

      const result = await getPitstops(SESSION_KEY);

      expect(result).toEqual([
        { driver_number: 44, lap_number: 10, pit_duration: "2.5", driver: driverHAM },
        { driver_number: 55, lap_number: 15, pit_duration: "3.0", driver: driverSAI },
      ]);
      expect(getRedis().set).toHaveBeenCalledWith(
        `pit_session_key_${SESSION_KEY}`,
        expect.stringContaining('"data"'),
        { ex: 86400 }
      );
    });

    it("deduplicates driver fetches — calls getDriver once per unique driver number", async () => {
      const multiplePitstopsForSameDriver = [
        { driver_number: 44, lap_number: 10, pit_duration: "2.5" },
        { driver_number: 44, lap_number: 30, pit_duration: "2.8" },
      ];
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(multiplePitstopsForSameDriver),
      });
      (getDriver as jest.Mock).mockResolvedValue(driverHAM);

      await getPitstops(SESSION_KEY);

      expect(getDriver).toHaveBeenCalledTimes(1);
      expect(getDriver).toHaveBeenCalledWith(44);
    });
  });

  describe("session is live — always fetches from API, skips cache write", () => {
    beforeEach(() => {
      (isSessionLive as jest.Mock).mockResolvedValue(true);
    });

    it("fetches from API without reading or writing Redis", async () => {
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(samplePitstops),
      });
      (getDriver as jest.Mock).mockResolvedValue(driverHAM);

      await getPitstops(SESSION_KEY);

      expect(getRedis().get).not.toHaveBeenCalled();
      expect(getRedis().set).not.toHaveBeenCalled();
      expect(rateLimitedFetch).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("returns an empty array when fetch throws", async () => {
      (isSessionLive as jest.Mock).mockResolvedValue(false);
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await getPitstops(SESSION_KEY);

      expect(result).toEqual([]);
    });

    it("returns an empty array when Redis throws", async () => {
      (isSessionLive as jest.Mock).mockResolvedValue(false);
      getRedis().get.mockRejectedValue(new Error("Redis down"));

      const result = await getPitstops(SESSION_KEY);

      expect(result).toEqual([]);
    });
  });
});
