import { getRaceControlBySession } from "../raceControl";

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

import { Redis } from "@upstash/redis";
import { rateLimitedFetch } from "../rateLimiter";
import { isSessionLive } from "../isSessionLive";

const getRedis = () => (Redis.fromEnv as jest.Mock)();

const API_ENDPOINT = "https://api.test/";
const SESSION_KEY = "9507";

const sampleRaceControl = [
  {
    session_key: SESSION_KEY,
    meeting_key: "1234",
    date: "2024-03-02T14:05:00",
    category: "Flag",
    message: "GREEN FLAG",
  },
  {
    session_key: SESSION_KEY,
    meeting_key: "1234",
    date: "2024-03-02T14:30:00",
    category: "SafetyCar",
    message: "SAFETY CAR DEPLOYED",
  },
];

beforeEach(() => {
  process.env.API_ENDPOINT = API_ENDPOINT;
  const redis = getRedis();
  (redis.get as jest.Mock).mockReset();
  (redis.set as jest.Mock).mockReset();
  (rateLimitedFetch as jest.Mock).mockReset();
  (isSessionLive as jest.Mock).mockReset();
});

describe("getRaceControlBySession", () => {
  describe("session is not live — cache path", () => {
    beforeEach(() => {
      (isSessionLive as jest.Mock).mockResolvedValue(false);
    });

    it("returns data from Redis when cache matches the query URL", async () => {
      const cachedData = {
        query: `${API_ENDPOINT}race_control?session_key=${SESSION_KEY}`,
        data: sampleRaceControl,
      };
      getRedis().get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await getRaceControlBySession(SESSION_KEY);

      expect(result).toEqual(sampleRaceControl);
      expect(rateLimitedFetch).not.toHaveBeenCalled();
    });

    it("returns data when Redis stores an object directly", async () => {
      const cachedData = {
        query: `${API_ENDPOINT}race_control?session_key=${SESSION_KEY}`,
        data: sampleRaceControl,
      };
      getRedis().get.mockResolvedValue(cachedData);

      const result = await getRaceControlBySession(SESSION_KEY);

      expect(result).toEqual(sampleRaceControl);
    });

    it("fetches from API on cache miss and stores result in Redis", async () => {
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(sampleRaceControl),
      });

      const result = await getRaceControlBySession(SESSION_KEY);

      expect(result).toEqual(sampleRaceControl);
      expect(rateLimitedFetch).toHaveBeenCalledWith(
        `${API_ENDPOINT}race_control?session_key=${SESSION_KEY}`
      );
      expect(getRedis().set).toHaveBeenCalledWith(
        `race_control_session_key_${SESSION_KEY}`,
        expect.stringContaining('"data"'),
        { ex: 86400 }
      );
    });

    it("fetches from API when cache query URL is stale", async () => {
      const staleCache = {
        query: "https://old-api.test/race_control?session_key=9999",
        data: [],
      };
      getRedis().get.mockResolvedValue(JSON.stringify(staleCache));
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(sampleRaceControl),
      });

      const result = await getRaceControlBySession(SESSION_KEY);

      expect(result).toEqual(sampleRaceControl);
      expect(rateLimitedFetch).toHaveBeenCalled();
    });
  });

  describe("session is live — always fetches from API, skips cache read and write", () => {
    beforeEach(() => {
      (isSessionLive as jest.Mock).mockResolvedValue(true);
    });

    it("fetches from API without reading or writing Redis", async () => {
      (rateLimitedFetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(sampleRaceControl),
      });

      const result = await getRaceControlBySession(SESSION_KEY);

      expect(result).toEqual(sampleRaceControl);
      expect(getRedis().get).not.toHaveBeenCalled();
      expect(getRedis().set).not.toHaveBeenCalled();
      expect(rateLimitedFetch).toHaveBeenCalledWith(
        `${API_ENDPOINT}race_control?session_key=${SESSION_KEY}`
      );
    });
  });

  describe("error handling", () => {
    it("returns an empty array when fetch throws", async () => {
      (isSessionLive as jest.Mock).mockResolvedValue(false);
      getRedis().get.mockResolvedValue(null);
      (rateLimitedFetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await getRaceControlBySession(SESSION_KEY);

      expect(result).toEqual([]);
    });

    it("returns an empty array when Redis throws", async () => {
      (isSessionLive as jest.Mock).mockResolvedValue(false);
      getRedis().get.mockRejectedValue(new Error("Redis down"));

      const result = await getRaceControlBySession(SESSION_KEY);

      expect(result).toEqual([]);
    });
  });
});
